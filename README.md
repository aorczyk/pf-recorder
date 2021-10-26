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
- playing commands in reverse order - RC Red and Blue Forward
- playing reversed commands (from channel 1) in reverse order  - RC Red and Blue Backward

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
    false
)
```
### Parameters
- `irReceiverPin` - the digital pin where IR Receiver Module is connected, eg: DigitalPin.P2
- `irTransmitterPin` - the analog pin where IR diode is connected, eg: AnalogPin.P0
- `recorderControlChannel` - the channel (0-3) for controlling recorder from PF remote control, eg: 1
- `skipAllStop` - if true, in Combo Direct Mode skips state: Red Float, Blue Float


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


## pfRecorder.play

Plays commands recorded by PF Receiver extension.

```sig
pfRecorder.play(commands)
```

### Parameters

- `commands` - the array with data of recorded commands


## pfRecorder.stopPlaying

Stops playing commands and stops all used outputs channels.

```sig
pfRecorder.stopPlaying()
```


## MakeCode Example

```blocks
let isPlaying = false;
pfRecorder.init(
    DigitalPin.P2,
    AnalogPin.P0,
    PfReceiverChannel.Channel2,
    false
)
```

## Disclaimer

LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this project.

## License

Copyright (C) 2021 Adam Orczyk

Licensed under the MIT License (MIT). See LICENSE file for more details.