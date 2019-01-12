import {setLogger} from './src/config'
import {NoopLogger} from './src/NoopLogger'

setLogger(new NoopLogger())
