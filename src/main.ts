import * as core from '@actions/core'
import { ActionInputs } from './helpers/actionInputs'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const inputs: ActionInputs = ActionInputs()

    // Perform computation
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
