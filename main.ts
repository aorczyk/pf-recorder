// Sprawdzić jak pakiety są wysyłane przez pilot
// Ulepszyć funkcję sendPacket - dodać scheduler, tak jak przy mixed
// Ujednolicić sendPacket i sendMixedPackets

basic.forever(function () {
	
})

pfReceiver.connectIrReceiver(DigitalPin.P2)
pfTransmitter.connectIrSenderLed(AnalogPin.P0)

let data: number[][] = [];
let isRecording = false;

function startRecord(){
    basic.clearScreen();
    led.plot(0, 0)
    serial.writeString('Recording...\n')
    data = [];
    pfReceiver.startRecord(data);
}

function stopRecord(){
    // led.unplot(0, 0)
    basic.showNumber(data.length);
    pfReceiver.stopRecord();
    serial.writeString(JSON.stringify(data) + '\n');
}

input.onButtonPressed(Button.A, function() {
    if (isRecording) {
        stopRecord();
    } else {
        startRecord()
    }

    isRecording = !isRecording
})

input.onButtonPressed(Button.B, function() {
    basic.showString('>')
    pfTransmitter.play(data);
    basic.clearScreen()
})
