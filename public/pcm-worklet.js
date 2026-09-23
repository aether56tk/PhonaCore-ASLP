class PhonaCorePCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0];
    if (input && input[0] && input[0].length) this.port.postMessage(new Float32Array(input[0]));
    const output = outputs[0];
    if (output && output[0]) output[0].fill(0);
    return true;
  }
}
registerProcessor('phonacore-pcm', PhonaCorePCMProcessor);
