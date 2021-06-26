/**
 * @file
 */
import {Server} from 'core/base/ipc/node/ipc.cp';
import {SearchChannel} from './searchIpc';
import {SearchService} from './rawSearchService';

const server = new Server('search');
const service = new SearchService();
const channel = new SearchChannel(service);
server.registerChannel('search', channel);
