import { createHistory, useQueries } from 'history';

const history = useQueries(createHistory)();
history.createPath('/foo/bar');
