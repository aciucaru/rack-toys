/* These interfaces represent an emitter (a source of signal) who's parameters can be modulated
** by an external modulator (the modulator is also an emitter).
**
** Any emitter that wishes to be modulated should implement one or more of these interfaces.
** The usual emitters that implement such interfaces are oscillators. */

export interface AmplitudeModulatableEmitter
{
    /* Method that returns an input that channels the received modulation to the internal nodes of
    ** the implementing class. Those nodes are supposed to be frequency modulated.
    **   The modulated emitter is usually an oscillator, but an oscillator could be made of more that one
    ** internal oscillator, so the modulator should be connected with all internal oscillators, not just one.
    **   This method is designed to do just that, to offer a input signal that directs the modulation to the
    ** corresponding reicevers. */
    getAmpModulationInputNode(): AudioNode;
}

export interface FrequencyModulatableEmitter
{
    /* Method that connects the external frequency modulator with all frequency modulatable nodes of the
    ** modulated emitter.
    **   The modulated emitter is usually an oscillator, but an oscillator could be made of more that one
    ** internal oscillator, so the modulator should be connected with all internal oscillators, not just one.
    **   This method is designed to do just that, to connect the frequency modulator withh all relevant internal nodes. */
    getFreqModulationInputNode(): AudioNode;
}

export interface PulseWidthModulatableEmitter
{
    /* Method that connects the external pulse-width modulator with all pulse width modulatable nodes of the
    ** modulated emitter.
    **   The modulated emitter is usually an oscillator, but an oscillator could be made of more that one
    ** internal oscillator, so the modulator should be connected with all internal oscillators, not just one.
    **   This method is designed to do just that, to connect the pulse-width modulator with all relevant internal nodes. */
    getPulseWidthModulationInputNode(): void;
}

export interface UnisonDetuneModulatableEmitter
{
    /* Method that connects the external unison-detune modulator with all unison-detune modulatable nodes of the
    ** modulated emitter.
    **   The modulated emitter is usually an oscillator, but an oscillator could be made of more that one
    ** internal oscillator, so the modulator should be connected with all internal oscillators, not just one.
    **   This method is designed to do just that, to connect the unison-detune modulator with all relevant internal nodes. */
    getUnisonDetuneModulationInputNode(): void;
}