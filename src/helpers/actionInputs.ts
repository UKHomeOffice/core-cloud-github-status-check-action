import * as core from '@actions/core'
import { isUndefinedOrEmpty } from './isUndefinedOrEmpty'

/**
 * ActionInputs is a factory function that returns an object with the action inputs
 * @returns {ActionInputs} The action inputs
 */

export interface ActionInputs {
  token: string;
  state: string;
  context: string;
  description: string;
  sha: string;
  owner: string;
  repo: string;
}

export const ActionInputs = (): ActionInputs => {

  interface InputValidation {
    (name: string, input: string): boolean;
  }

  const hasValidState: InputValidation = (name: string, input: string) : boolean => {
    const valid = ['success', 'failure', 'error', 'pending'].includes(input);

    if (!valid) {
      throw new Error(`Invalid value for input '${name}', must be one of 'success', 'failure', 'error', 'pending'.`);
    }

    return true;
  }

  const hasValidSha = (name: string, input: string) : boolean => {
    if (!/^[a-f0-9]{40}$/i.test(input)) {
      throw new Error(`Invalid value for input '${name}', must be a valid SHA-1 hash.`);
    }

    return true;
  }


  const hasValue: InputValidation = (name: string, input: string) : boolean => {
    if (isUndefinedOrEmpty(input)) {
      throw new Error(`Input '${name}' is required.`);
    }

    return true;
  }

  const parseInput = (name: string, required: boolean, validate: InputValidation): string => {
    const value = core.getInput(name, { required });

    if (!validate(name, value)) {
      throw new Error(`Invalid value for input '${name}'.`);
    }

    return value;
  }

  return {
    token: parseInput('token', false, hasValue),
    state: parseInput('state', true, hasValidState),
    context: parseInput('context', true, hasValue),
    description: parseInput('description', false, (_)=> true),
    sha: parseInput('sha', false,  hasValidSha),
    owner: parseInput('owner', false, hasValue),
    repo: parseInput('repo', false, hasValue),
  }
}
