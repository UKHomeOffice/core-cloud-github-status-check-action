import * as core from '@actions/core'
import { ActionInputResult, ActionInputs } from './helpers/actionInputs'
import { GitHub } from './github'
import { getOctokit } from '@actions/github'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const inputs: ActionInputResult = ActionInputs()

    await GitHub(getOctokit(inputs.token)).createCommitStatus(
      inputs.owner,
      inputs.repo,
      inputs.sha,
      inputs.context,
      inputs.state,
      inputs.description
    )
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
