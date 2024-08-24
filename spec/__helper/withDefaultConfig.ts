import {Event} from "jest-circus";
import {Config} from "@jest/types";
import {EnvironmentContext} from "@jest/environment";
import AkashicEnvironment from "../../src";
import {err} from "./common";

export let env: AkashicEnvironment | undefined;

beforeEach(async () => {
  try {
    env = new AkashicEnvironment({
      globalConfig: jest.fn<Config.GlobalConfig, []>() as any,
      projectConfig: {
        ...jest.fn<Config.ProjectConfig, []>() as any,
        testEnvironmentOptions: {}
      }
    }, jest.fn<EnvironmentContext, []>() as any);
    await env.setup()
    await env.handleTestEvent({
      ...jest.fn<Event, []>() as any,
      name: "test_start"
    });
  } catch(e) {
    err.e = e as Error;
  }
}, 10000)
afterEach(async () => {
  if (env) {
    await env.teardown()
  }
  env = undefined;
  err.e = undefined;
})
