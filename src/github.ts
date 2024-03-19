import * as core from '@actions/core'
import { Octokit } from '@octokit/core'
import { PaginateInterface } from '@octokit/plugin-paginate-rest' // eslint-disable-line import/named
import { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types' // eslint-disable-line import/no-unresolved

export type GitHubAction = {
  createCommitStatus(
    owner: string,
    repo: string,
    sha: string,
    context: string,
    state: 'success' | 'failure' | 'error' | 'pending',
    description: string
  ): Promise<void>
}

export const GitHub = (
  octokit: Octokit & Api & { paginate: PaginateInterface }
): GitHubAction => {
  return {
    createCommitStatus: async (
      owner: string,
      repo: string,
      sha: string,
      context: string,
      state: 'success' | 'failure' | 'error' | 'pending',
      description: string
    ) => {
      await octokit.rest.repos.createCommitStatus({
        owner,
        repo,
        sha,
        state,
        description,
        context
      })

      core.info(
        `Created commit status ${context} marked ${state} for ${sha} on ${owner}/${repo}.`
      )
    }
  }
}
