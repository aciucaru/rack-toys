import { Settings } from "../../../constants/settings";
import type { IntermediateEmitter } from "../../core/emitter";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


interface ToggledInput
{
    inputNode: AudioNode;
    inputGainToggleNode: GainNode;
    isEnabled: boolean;
}

/*    Class that represents a general-purpose on/off mixing node.
**    This node can accept an arbitrary number of inputs (which must be Web Audio API AudioNodes or subclasses) and then
** ads these inputs togheter, where each input can be enabled (gain = 1) or disabled (gain = 0).
**   This class allows adding new input nodes and allows muting/unmuting each input.
**   The inputs are stored in a unidimensional array and are accessed by their index, so reordering the inputs is not possible,
** once an input has been added, it holds it's index in the array. */
export class ToggleMixer implements IntermediateEmitter
{
    private audioContext: AudioContext;

    private inputsArray: Array<ToggledInput>;

    private outputNode: GainNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "ToggleMixer", minLevel: Settings.minLogLevel });

    public constructor(audioContext: AudioContext)
    {
        this.audioContext = audioContext;

        this.inputsArray = new Array<ToggledInput>();

        this.outputNode = this.audioContext.createGain();

        this.computeFinalGain();
    }

    /* Method inherited from 'IntermediateEmitter' interface */
    public getOutputNode(): AudioNode { return this.outputNode; }

    // Abstract method inherited from 'BaseMultipleInputsNode' abstract class
    public connectInput(inputNode: AudioNode): void
    {
        ToggleMixer.logger.debug("connectInput()");

        // Create and add the additive input to the array of inputs
        const newInput: ToggledInput = {inputNode: inputNode, inputGainToggleNode: this.audioContext.createGain(), isEnabled: false };
        this.inputsArray.push(newInput);

        // Connect the added input to it's corresponding gain node
        inputNode.connect(newInput.inputGainToggleNode);

        // Connect the gain toggle node to the fianl output node
        newInput.inputGainToggleNode.connect(this.outputNode);

        // Set the gain value of the gain node corresponding to the input.
        // The gain will be such that the newly added input is disabled/muted
        newInput.inputGainToggleNode.gain.setValueAtTime(Settings.multipleInputsMinGain, this.audioContext.currentTime);

        // recompute the output final gain
        this.computeFinalGain();
    }

    public disconnectAllInputs(): void
    {
        const length = this.inputsArray.length;

        for (let i = 0; i < length; i++)
        {
            if (this.inputsArray[i].isEnabled)
                this.toggleInputOff(i);
        }
    }

    // One of the main methods of this class: it mutes (toggles off) an input by it's index
    public toggleInputOff(inputIndex: number): boolean
    {
        if (0 <= inputIndex && inputIndex < this.inputsArray.length)
        {
            ToggleMixer.logger.debug(`muteInput(${inputIndex}): started`);

            this.inputsArray[inputIndex].isEnabled = false;
            this.inputsArray[inputIndex].inputGainToggleNode.gain.linearRampToValueAtTime(Settings.multipleInputsMinGain, this.audioContext.currentTime);

            this.computeFinalGain();

            return true; // change was succesfull
        }
        else
        {
            ToggleMixer.logger.warn(`muteInput(${inputIndex}): input index out of range`);
            return false;  // change was not succesfull
        }
    }

    // One of the main methods of this class: it unmutes (toggles on) an input by it's index
    public toggleInputOn(inputIndex: number): boolean
    {
        if (0 <= inputIndex && inputIndex < this.inputsArray.length)
        {
            ToggleMixer.logger.debug(`unmuteInput(${inputIndex}): started`);

            this.inputsArray[inputIndex].isEnabled = true;
            this.inputsArray[inputIndex].inputGainToggleNode.gain.linearRampToValueAtTime(Settings.multipleInputsMaxGain, this.audioContext.currentTime);

            this.computeFinalGain();

            return true; // change was succesfull
        }
        else
        {
            ToggleMixer.logger.warn(`unmuteInput(${inputIndex}): input index out of range`);
            return false;  // change was not succesfull
        }
    }

    // Flip the toggle state of an input (from 'on' it turnes it into 'off' and viceversa)
    public toggleInput(inputIndex: number): boolean
    {
        if (0 <= inputIndex && inputIndex < this.inputsArray.length)
        {
            ToggleMixer.logger.debug(`toggleInput(${inputIndex}): started`);

            if (this.inputsArray[inputIndex].isEnabled === true)
            {
                // Flip the input's toggle state
                this.inputsArray[inputIndex].isEnabled = false;
                this.inputsArray[inputIndex].inputGainToggleNode.gain.linearRampToValueAtTime(Settings.multipleInputsMinGain, this.audioContext.currentTime);
            }
            else
            {
                // Flip the input's toggle state
                this.inputsArray[inputIndex].isEnabled = true;
                this.inputsArray[inputIndex].inputGainToggleNode.gain.linearRampToValueAtTime(Settings.multipleInputsMaxGain, this.audioContext.currentTime);

            }

            this.computeFinalGain();

            return true; // change was succesfull
        }
        else
        {
            ToggleMixer.logger.warn(`toggleInput(${inputIndex}): input index out of range`);
            return false;  // change was not succesfull
        }
    }

    // Counts how many enabled inputs there are, it use the ToggledInput's 'isEnabled' property
    private countToggledOnInputs(): number
    {
        ToggleMixer.logger.debug("countEnabledInputs(): started");

        let enabledInputs = 0;

        for (const input of this.inputsArray)
        {
            if (input.isEnabled)
                enabledInputs++;
        }

        return enabledInputs;
    }

    // Computes and sets the gain of the final ouput gain node
    private computeFinalGain(): void
    {
        ToggleMixer.logger.debug("computeFinalGain(): started");

        let enabledInputsCount = this.countToggledOnInputs();

        let finalGain = 0;

        if (enabledInputsCount > 0)
            finalGain = (Settings.multipleInputsMaxGain / enabledInputsCount) - Number.EPSILON;
        else
            finalGain = Settings.multipleInputsMinGain;

        this.outputNode.gain.linearRampToValueAtTime(finalGain, this.audioContext.currentTime);
    }
}