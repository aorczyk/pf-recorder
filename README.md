# Power Functions Recorder

Records commands from LEGO Power Functions remote controls and plays them. Using IR Receiver Module Iduino ST1089 and IR 940 nm emitting diode.

### Features:
- all PF remote controls are supported
- saveing 10 recordings 
- possibility to play in reverse order
- possibility to reverse commands from specified channel and output

### Functions
- start/stop record - Button A or Rremote Control Red Forward
- start/stop play - Button B or RC Red Backward
- next record number - Button AB or RC Blue Forward 
- previous record number - RC Blue Backward 
- run custom action 1 - RC Red and Blue Forward 
- run custom action 2 - RC Red and Blue Backward 

### :warning: Warning!
**Lighting the diode and the IR receiver with sunlight :sunny: or from an ordinary light bulb :bulb: may interfere with the signal reception.**

## Installation

1. Open MakeCode and select '+ Extensions' in the 'Advanced' menu. 
2. Enter the project URL https://github.com/aorczyk/pf-recorder in the search field.
3. Select the `PF Recorder` extension.

# Documentation

## pfRecorder.init

Initialize recorder.

```sig
pfRecorder.init(
    DigitalPin.P2,
    AnalogPin.P0,
    PfReceiverChannel.Channel2,
    (data: number[][]) => {
        // Do something when RC Red and Blue are Forward.
    },
    (data: number[][]) => {
        // Do something when RC Red and Blue are Backward.
    }
)
```
### Parameters
- `irReceiverPin` - the digital pin where IR Receiver Module is connected, eg: DigitalPin.P2
- `irTransmitterPin` - the analog pin where IR diode is connected, eg: AnalogPin.P0
- `recorderControlChannel` - the channel (0-3) for controlling recorder from PF remote control, eg: 1
- `customAction1` - the function which is run when red and blue button is switched to Forward
- `customAction2` - the function which is run when red and blue button is switched to Backward


## pfRecorder.reverseOrder

Returns commands list in reversed order.

```sig
let commandsInReversedOrder = pfRecorder.reverseOrder(recordedCommands);
```

### Parameters
- `commands` - the recorded commands


## pfRecorder.reverseCommands

Processes and returns command list reversing only commands from given channel and output.

```sig
let reversedCommands = pfRecorder.reverseCommands(recordedCommands, 0, 0);
```

### Parameters
- `commands` - the recorded commands
- `channel` - the channel (0-3), eg. 0
- `output` - the output: 0 (Red), 1 (Blue), eg. 0


## MakeCode Example

```blocks
let isPlaying = false;
pfRecorder.init(
    DigitalPin.P2,
    AnalogPin.P0,
    PfReceiverChannel.Channel2,
    (data: number[][]) => {
        if (!isPlaying) {
            isPlaying = true;
            let reversed = pfRecorder.reverseOrder(data);
            led.plot(4, 0)

            control.runInBackground(() => {
                pfTransmitter.play(reversed);
                basic.clearScreen()
                isPlaying = false;
            })
        } else {
            isPlaying = false;
            pfTransmitter.stopPlaying();
            basic.clearScreen()
        }
    },
    (data: number[][]) => {
        if (!isPlaying) {
            isPlaying = true;
            let reversed = pfRecorder.reverseCommands(data, 0, 0);
            led.plot(4, 0)
            
            control.runInBackground(() => {
                pfTransmitter.play(reversed);
                basic.clearScreen()
                isPlaying = false;
            })
        } else {
            isPlaying = false;
            pfTransmitter.stopPlaying();
            basic.clearScreen()
        }
    }
)
```

## Disclaimer

LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this project.

## License

Copyright (C) 2021 Adam Orczyk

Licensed under the MIT License (MIT). See LICENSE file for more details.