import { put, takeEvery, select, call } from 'redux-saga/effects';
import uuid from 'uuid/v4';

import { ActionModel, MessageModel, WelcomeMessageModel, TransferModel, TransferMessageModel, NameMessageModel, ActionMessageModel, RTCDescriptionMessageModel, RTCCandidateMessageModel, NetworkMessageModel } from '../types/Models';
import { ActionType } from '../types/ActionType';
import { StateType } from '../reducers';
import transferSendFile from './transferSendFile';
import transferReceiveFile from './transferReceiveFile';

function* message(action: ActionModel, dispatch: (action: any) => void) {
    const msg: MessageModel = action.value as MessageModel;

    switch (msg.type) {
        case 'welcome':
            yield put({ type: ActionType.SET_SUGGESTED_NAME, value: (msg as WelcomeMessageModel).suggestedName });
            yield put({ type: ActionType.SET_CLIENT_ID, value: (msg as WelcomeMessageModel).clientId });
            yield put({ type: ActionType.SET_CLIENT_COLOR, value: (msg as WelcomeMessageModel).clientColor });
            break;
        case 'transfer':
            const transferMessage: TransferMessageModel = msg as TransferMessageModel;
            const transfer: TransferModel = {
                fileName: transferMessage.fileName,
                fileType: transferMessage.fileType,
                fileSize: transferMessage.fileSize,
                transferId: transferMessage.transferId,
                clientId: transferMessage.clientId,
            };

            yield put({ type: ActionType.ADD_INCOMING_TRANSFER, value: transfer });
            break;
        case 'action':
            const actionMessage: ActionMessageModel = msg as ActionMessageModel;

            switch (actionMessage.action) {
                case 'cancel':
                    yield put({ type: ActionType.REMOVE_INCOMING_TRANSFER, value: actionMessage.transferId });
                    break;
                case 'accept':
                    yield call(() => transferSendFile(actionMessage, dispatch));
                    break;
                case 'reject':
                    yield put({ type: ActionType.REMOVE_OUTGOING_TRANSFER, value: actionMessage.transferId });
                    break;
            }
            break;
        case 'network':
            const networkMessage: NetworkMessageModel = msg as NetworkMessageModel;
            yield put({ type: ActionType.SET_NETWORK, value: networkMessage.clients });
            break;
        case 'rtcDescription':
            const rtcMessage: RTCDescriptionMessageModel = msg as RTCDescriptionMessageModel;
            
            if (rtcMessage.data.type === 'answer') {
                yield put({ type: ActionType.SET_REMOTE_DESCRIPTION, value: {
                    transferId: rtcMessage.transferId,
                    data: rtcMessage.data,
                } });
            } else {
                yield call(() => transferReceiveFile(rtcMessage, dispatch));
            }
            break;
        case 'rtcCandidate':
            const rtcCandidate: RTCCandidateMessageModel = msg as RTCCandidateMessageModel;
            yield put({ type: ActionType.ADD_ICE_CANDIDATE, value: {
                transferId: rtcCandidate.transferId,
                data: rtcCandidate.data,
            } });
            break;
    }
}

function* connected() {
    yield put({ type: ActionType.SET_CONNECTED, value: true });

    let networkName = yield select((state: StateType) => state.networkName);
    if (networkName && networkName !== '') {
        const message: NameMessageModel = {
            type: 'name',
            networkName: networkName,
        };

        yield put({ type: ActionType.WS_SEND_MESSAGE, value: message });
    }
}

function* setName(action: ActionModel) {
    const message: NameMessageModel = {
        type: 'name',
        networkName: action.value,
    };

    yield put({ type: ActionType.WS_SEND_MESSAGE, value: message });
}

function* disconnected() {
    yield put({ type: ActionType.SET_CONNECTED, value: false });
}

function* createTransfer(action: ActionModel) {
    const file: File = action.value.file;

    const transfer: TransferModel = {
        file: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream', // fileType is required by the server.
        transferId: uuid(),
        clientId: action.value.clientId,
    };

    yield put({ type: ActionType.ADD_OUTGOING_TRANSFER, value: transfer });

    const model: TransferMessageModel = {
        type: 'transfer',
        transferId: transfer.transferId,
        fileName: transfer.fileName,
        fileSize: transfer.fileSize,
        fileType: transfer.fileType,
        targetId: transfer.clientId,
    };

    yield put({ type: ActionType.WS_SEND_MESSAGE, value: model });
}

function* cancelTransfer(action: ActionModel) {
    const outgoingTransfers: TransferModel[] = yield select((state: StateType) => state.outgoingTransfers);
    const filteredTransfers: TransferModel[] = outgoingTransfers.filter((transfer) => transfer.transferId === action.value);
    if (filteredTransfers.length === 0) return;

    const transfer = filteredTransfers[0];
    if (!transfer) return;

    const model: ActionMessageModel = {
        type: 'action',
        transferId: transfer.transferId,
        targetId: transfer.clientId,
        action: 'cancel',
    };

    yield put({ type: ActionType.WS_SEND_MESSAGE, value: model });
    yield put({ type: ActionType.REMOVE_OUTGOING_TRANSFER, value: action.value });
}

function* acceptTransfer(action: ActionModel) {
    const incomingTransfers: TransferModel[] = yield select((state: StateType) => state.incomingTransfers);
    const filteredTransfers: TransferModel[] = incomingTransfers.filter((transfer) => transfer.transferId === action.value);
    if (filteredTransfers.length === 0) return;

    const transfer = filteredTransfers[0];
    if (!transfer) return;

    const model: ActionMessageModel = {
        type: 'action',
        transferId: transfer.transferId,
        targetId: transfer.clientId,
        action: 'accept',
    };

    yield put({ type: ActionType.WS_SEND_MESSAGE, value: model });
    yield put({ type: ActionType.MOVE_INCOMING_TRANSFER_TO_ACTIVE, value: action.value });
}

function* rejectTransfer(action: ActionModel) {
    const incomingTransfers: TransferModel[] = yield select((state: StateType) => state.incomingTransfers);
    const filteredTransfers: TransferModel[] = incomingTransfers.filter((transfer) => transfer.transferId === action.value);
    if (filteredTransfers.length === 0) return;

    const transfer = filteredTransfers[0];
    if (!transfer) return;

    const model: ActionMessageModel = {
        type: 'action',
        transferId: transfer.transferId,
        targetId: transfer.clientId,
        action: 'reject',
    };

    yield put({ type: ActionType.WS_SEND_MESSAGE, value: model });
    yield put({ type: ActionType.REMOVE_INCOMING_TRANSFER, value: action.value });
}

export default function* root(dispatch: (action: any) => void) {
    yield takeEvery(ActionType.WS_MESSAGE, function* (action: ActionModel) {
        yield call(() => message(action, dispatch));
    });
    yield takeEvery(ActionType.WS_CONNECTED, connected);
    yield takeEvery(ActionType.WS_DISCONNECTED, disconnected);

    yield takeEvery(ActionType.SET_NETWORK_NAME, setName);

    yield takeEvery(ActionType.CREATE_TRANSFER, createTransfer);
    yield takeEvery(ActionType.CANCEL_TRANSFER, cancelTransfer);

    yield takeEvery(ActionType.ACCEPT_TRANSFER, acceptTransfer);
    yield takeEvery(ActionType.REJECT_TRANSFER, rejectTransfer);
};