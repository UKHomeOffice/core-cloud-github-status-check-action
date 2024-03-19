/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import { setupServer } from 'msw/node'
import { http } from 'msw'
import { toErrorMessage } from './helpers/utils'
import * as octokit from '@actions/github'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let infoMock: jest.SpiedFunction<typeof core.info>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>

const originalGetOctokit = octokit.getOctokit
let octokitMock: jest.SpiedFunction<typeof octokit.getOctokit>

describe('action', () => {
  const server = setupServer(
    http.post(
      'https://api.github.com/repos/ukhomeoffice/core-cloud-github-status-check-action/statuses/012345678901234567890123456789abcdefabcd',
      () => {
        return new Response(
          JSON.stringify({
            status: 201,
            url: 'https://api.github.com/repos/ukhomeoffice/core-cloud-github-status-check-action/statuses/012345678901234567890123456789abcdefabcd',
            headers: [],
            data: {
              url: 'https://api.github.com/repos/khomeoffice/core-cloud-github-status-check-action/statuses/012345678901234567890123456789abcdefabcd',
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

  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()

    octokitMock = jest
      .spyOn(octokit, 'getOctokit')
      .mockImplementation((token: string, _options?, ..._additionalPlugins) => {
        return originalGetOctokit(
          token,
          { ..._options, request: { fetch: global.fetch } },
          ..._additionalPlugins
        )
      })

    server.listen()
  })

  afterEach(() => server.resetHandlers())

  afterAll(() => server.close())

  it('should pass with appropriate inputs', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        // for each input in action.yml, return a string
        case 'token':
          return 'token'
        case 'state':
          return 'success'
        case 'context':
          return 'context'
        case 'description':
          return 'description'
        case 'sha':
          return '012345678901234567890123456789abcdefabcd'
        case 'owner':
          return 'ukhomeoffice'
        case 'repo':
          return 'core-cloud-github-status-check-action'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(octokitMock).toHaveBeenCalled()
    expect(infoMock).toHaveBeenCalledWith(
      'Created commit status context marked success for 012345678901234567890123456789abcdefabcd on ukhomeoffice/core-cloud-github-status-check-action.'
    )
    expect(setFailedMock).not.toHaveBeenCalled()
  })

  it('should fail with incorrect sha', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        // for each input in action.yml, return a string
        case 'token':
          return 'token'
        case 'state':
          return 'success'
        case 'context':
          return 'context'
        case 'description':
          return 'description'
        case 'sha':
          return '4220000000000000000000000000000000000000'
        case 'owner':
          return 'ukhomeoffice'
        case 'repo':
          return 'core-cloud-github-status-check-action'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(octokitMock).toHaveBeenCalled()
    expect(infoMock).not.toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalledWith(
      'No commit found for SHA: 4220000000000000000000000000000000000000 - https://docs.github.com/rest/commits/statuses#create-a-commit-status'
    )
  })

  it('should set failed with no token set', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return ''
        case 'state':
          return 'success'
        case 'context':
          return 'context'
        case 'description':
          return 'description'
        case 'sha':
          return '012345678901234567890123456789abcdefabcd'
        case 'owner':
          return 'owner'
        case 'repo':
          return 'repo'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith("Input 'token' is required.")
  })

  it('should set failed with invalid state set', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'test'
        case 'state':
          return 'UNKNOWN'
        case 'context':
          return 'context'
        case 'description':
          return 'description'
        case 'sha':
          return '012345678901234567890123456789abcdefabcd'
        case 'owner':
          return 'owner'
        case 'repo':
          return 'repo'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith(
      "Invalid value for input 'state', must be one of 'success', 'failure', 'error', 'pending'."
    )
  })

  it('should set failed with invalid context set', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'test'
        case 'state':
          return 'success'
        case 'context':
          return ''
        case 'description':
          return 'description'
        case 'sha':
          return '012345678901234567890123456789abcdefabcd'
        case 'owner':
          return 'owner'
        case 'repo':
          return 'repo'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith("Input 'context' is required.")
  })

  it('should set failed with no sha', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'test'
        case 'state':
          return 'success'
        case 'context':
          return 'context'
        case 'description':
          return 'description'
        case 'sha':
          return ''
        case 'owner':
          return 'owner'
        case 'repo':
          return 'repo'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith(
      "Invalid value for input 'sha', must be a valid SHA-1 hash."
    )
  })

  it('should set failed with invalid sha length', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'test'
        case 'state':
          return 'success'
        case 'context':
          return 'context'
        case 'description':
          return 'description'
        case 'sha':
          return '1'
        case 'owner':
          return 'owner'
        case 'repo':
          return 'repo'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith(
      "Invalid value for input 'sha', must be a valid SHA-1 hash."
    )
  })

  it('should set failed with invalid sha', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'test'
        case 'state':
          return 'success'
        case 'context':
          return 'context'
        case 'description':
          return 'description'
        case 'sha':
          return 'ZZZ345678901234567890123456789abcdefabcd'
        case 'owner':
          return 'owner'
        case 'repo':
          return 'repo'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith(
      "Invalid value for input 'sha', must be a valid SHA-1 hash."
    )
  })

  it('should set failed with no owner set', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'test'
        case 'state':
          return 'success'
        case 'context':
          return 'context'
        case 'description':
          return 'description'
        case 'sha':
          return '012345678901234567890123456789abcdefabcd'
        case 'owner':
          return ''
        case 'repo':
          return 'repo'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith("Input 'owner' is required.")
  })

  it('should set failed with no repo set', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'test'
        case 'state':
          return 'success'
        case 'context':
          return 'context'
        case 'description':
          return 'description'
        case 'sha':
          return '012345678901234567890123456789abcdefabcd'
        case 'owner':
          return 'owner'
        case 'repo':
          return ''
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith("Input 'repo' is required.")
  })
})
