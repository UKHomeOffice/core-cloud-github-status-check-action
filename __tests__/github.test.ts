import * as core from '@actions/core'
import { getOctokit } from '@actions/github'
import { http } from 'msw'
import { setupServer } from 'msw/node'

import { GitHub } from '../src/github'
import { toErrorMessage } from './helpers/utils'

/**
 * Unit tests for the action's GitHub functionality, src/github.ts
 */

// Mock the GitHub Actions core library
let infoMock: jest.SpiedFunction<typeof core.info>

describe('github', () => {
  const server = setupServer(
    http.post(
      'https://api.github.com/repos/ukhomeoffice/core-cloud-github-status-check-action/statuses/2010000000000000000000000000000000000000',
      () => {
        return new Response(
          JSON.stringify({
            status: 201,
            url: 'https://api.github.com/repos/ukhomeoffice/core-cloud-github-status-check-action/statuses/2010000000000000000000000000000000000000',
            headers: [],
            data: {
              url: 'https://api.github.com/repos/khomeoffice/core-cloud-github-status-check-action/statuses/2010000000000000000000000000000000000000',
              avatar_url: '_',
              id: 0o00000000000,
              node_id: '-------------------------',
              state: 'success',
              description: 'description',
              target_url: null,
              context: 'context',
              created_at: '2000-01-01T00:00:00Z',
              updated_at: '2000-01-01T00:00:00Z',
              creator: {}
            }
          }),
          {
            status: 201
          }
        )
      }
    ),
    http.post(
      'https://api.github.com/repos/x/x/statuses/4040000000000000000000000000000000000000',
      () => {
        return new Response(
          toErrorMessage({
            message: 'Not Found',
            documentation_url:
              'https://docs.github.com/rest/commits/statuses#create-a-commit-status'
          }),
          {
            status: 404
          }
        )
      }
    ),
    http.post(
      'https://api.github.com/repos/ukhomeoffice/core-cloud-github-status-check-action/statuses/4220000000000000000000000000000000000000',
      () => {
        return new Response(
          toErrorMessage({
            message:
              'No commit found for SHA: 4220000000000000000000000000000000000000',
            documentation_url:
              'https://docs.github.com/rest/commits/statuses#create-a-commit-status'
          }),
          {
            status: 422
          }
        )
      }
    )
  )

  beforeAll(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()

    server.listen()
  })

  afterEach(() => server.resetHandlers())

  afterAll(() => server.close())

  it('should return 201 with correct inputs', async () => {
    await GitHub(
      getOctokit('INVALID_TOKEN', { request: { fetch: global.fetch } })
    ).createCommitStatus(
      'ukhomeoffice',
      'core-cloud-github-status-check-action',
      '2010000000000000000000000000000000000000',
      'context',
      'success',
      'description'
    )

    expect(infoMock).toHaveBeenCalledWith(
      'Created commit status context marked success for 2010000000000000000000000000000000000000 on ukhomeoffice/core-cloud-github-status-check-action.'
    )
  })

  it('should throw error upstream', async () => {
    await expect(
      GitHub(getOctokit('INVALID_TOKEN')).createCommitStatus(
        'ukhomeoffice',
        'core-cloud-github-status-check-action',
        '0000000000000000000000000000000000000000',
        'context',
        'success',
        'description'
      )
    ).rejects.toThrow('Bad credentials - https://docs.github.com/rest')
  })

  it('should throw error upstream with 404 from unknown owner/repo', async () => {
    await expect(
      GitHub(
        getOctokit('INVALID_TOKEN', { request: { fetch: global.fetch } })
      ).createCommitStatus(
        'X',
        'X',
        '4040000000000000000000000000000000000000',
        'context',
        'success',
        'description'
      )
    ).rejects.toThrow(
      'Not Found - https://docs.github.com/rest/commits/statuses#create-a-commit-status'
    )
  })

  it('should throw error upstream with 422 from unknown sha', async () => {
    await expect(
      GitHub(
        getOctokit('INVALID_TOKEN', { request: { fetch: global.fetch } })
      ).createCommitStatus(
        'ukhomeoffice',
        'core-cloud-github-status-check-action',
        '4220000000000000000000000000000000000000',
        'context',
        'success',
        'description'
      )
    ).rejects.toThrow(
      'No commit found for SHA: 4220000000000000000000000000000000000000 - https://docs.github.com/rest/commits/statuses#create-a-commit-status'
    )
  })
})
