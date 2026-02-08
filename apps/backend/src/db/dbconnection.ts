import mongoose from "mongoose";

enum MongooseType {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    ERROR = 'error'
}

enum ProcessSignalType {
    SIGNAL_INTERRUPTION = 'SIGINT',
    SIGNAL_TERMINATION = 'SIGTERM',
    SIGNAL_RESTART = 'SIGUSR2'
}

mongoose.connect(process.env.DATABASE_URL);

const handleConnected = function() {
    console.log(`${process.env.MONGOOSE}`)
}

const handleDisconnected = function(){
    console.log(process.env.MONGOOSE_DISCONNECTED_MESSAGE);
}

const handleError = function(error) {
    console.log(`${process.env.MONGOOSE_ERROR_MESSAGE} ${error}`);
}

mongoose.connection.on(MongooseType.CONNECTED, handleConnected);
mongoose.connection.on(MongooseType.DISCONNECTED, handleDisconnected);
mongoose.connection.on(MongooseType.ERROR, handleError);

const handleSIGINT = async function() {
    await mongoose.connection.close();
    _handleProcessSignal(ProcessSignalType.SIGNAL_INTERRUPTION)
}

const handleSIGTERM = async function() {
    await mongoose.connection.close();    
    _handleProcessSignal(ProcessSignalType.SIGNAL_TERMINATION);
}
const handleSIGUSR2 = async function() {
    await mongoose.connection.close();
    _handleProcessSignal.bind(ProcessSignalType.SIGNAL_RESTART);
}

process.on(ProcessSignalType.SIGNAL_INTERRUPTION, handleSIGINT);
process.on(ProcessSignalType.SIGNAL_TERMINATION, handleSIGTERM);
process.on(ProcessSignalType.SIGNAL_RESTART, handleSIGUSR2);

const _handleProcessSignal = function(processSignalType: ProcessSignalType) {
    console.log(process.env[processSignalType + "_MESSAGE"]);
    if (processSignalType === process.env.SIGNAL_RESTART) {
        process.kill(process.pid, processSignalType);
        return;
    }
    process.exit(0);
}