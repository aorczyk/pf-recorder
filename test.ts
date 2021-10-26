let isPlaying = false;
pfRecorder.init(
    DigitalPin.P2,
    AnalogPin.P0,
    [PfReceiverChannel.Channel1],
    PfReceiverChannel.Channel2,
    false
)

// {
//     // Sometimes program registers more commands, some commands are missed by LEGO PF receiver.
//     pfRecorder.play([[101, 6570, 0, 6, 1, 1, 101], [101, 6704, 0, 6, 1, 1, 101], [101, 6812, 0, 6, 1, 1, 101], [101, 7081, 0, 6, 1, 1, 101], [101, 7218, 0, 6, 1, 1, 101], [101, 7324, 0, 6, 1, 1, 101], [100, 7725, 0, 6, 0, 1, 100], [100, 7878, 0, 6, 0, 1, 100], [100, 8035, 0, 6, 0, 1, 100], [100, 8190, 0, 6, 0, 1, 100], [100, 8341, 0, 6, 0, 1, 100], [
//         100, 8469, 0, 6, 0, 1, 100]])
// }