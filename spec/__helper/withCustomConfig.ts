import {Event} from "jest-circus";
import {Config} from "@jest/types";
import {EnvironmentContext} from "@jest/environment";
import fs from "node:fs";
import AkashicEnvironment from "../../src";
import {err} from "./common";

export let customEnv: AkashicEnvironment | undefined;

beforeEach(async () => {
  try {
    customEnv = new AkashicEnvironment({
      globalConfig: jest.fn<Config.GlobalConfig, []>() as any,
      projectConfig: {
        ...jest.fn<Config.ProjectConfig, []>() as any,
        testEnvironmentOptions: { screenshotDir: "tmp/custom" }
      }
    }, jest.fn<EnvironmentContext, []>() as any);
    await customEnv.setup()
    await customEnv.handleTestEvent({
      ...jest.fn<Event, []>() as any,
      name: "test_start"
    });
  } catch(e) {
    err.e = e as Error;
  }
})
afterEach(async () => {
  if (customEnv) {
    await customEnv.teardown()
  }
  customEnv = undefined;
  err.e = undefined;
})

afterAll(() => {
  if (fs.existsSync("custom")) {
    fs.rmSync("custom", { recursive: true });
  }
})
