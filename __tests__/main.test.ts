/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

/* eslint  @typescript-eslint/no-unused-vars: "off" */ // Ignore until implementation.

import * as core from '@actions/core'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

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
          return 'owner'
        case 'repo':
          return 'repo'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).not.toHaveBeenCalled()
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
      expect(setFailedMock).toHaveBeenCalledWith('Input \'token\' is required.')
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
    expect(setFailedMock).toHaveBeenCalledWith('Invalid value for input \'state\', must be one of \'success\', \'failure\', \'error\', \'pending\'.')
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
    expect(setFailedMock).toHaveBeenCalledWith('Input \'context\' is required.')
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
    expect(setFailedMock).toHaveBeenCalledWith('Invalid value for input \'sha\', must be a valid SHA-1 hash.')
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
    expect(setFailedMock).toHaveBeenCalledWith('Invalid value for input \'sha\', must be a valid SHA-1 hash.')
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
    expect(setFailedMock).toHaveBeenCalledWith('Invalid value for input \'sha\', must be a valid SHA-1 hash.')
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
    expect(setFailedMock).toHaveBeenCalledWith('Input \'owner\' is required.')
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
    expect(setFailedMock).toHaveBeenCalledWith('Input \'repo\' is required.')
  })

})
