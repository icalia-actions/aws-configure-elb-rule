import { info, getInput, setOutput } from "@actions/core";

import {
  configureLoadBalancerRule,
  ConfigureLoadBalancerRuleInput,
} from "./lb-rule-mgmt";

export async function run() {
  const rule = await configureLoadBalancerRule({
    tags: getInput("tags"),
    actions: getInput("actions"),
    listener: getInput("listener"),
    priority: getInput("priority"),
    conditions: getInput("conditions"),
  } as ConfigureLoadBalancerRuleInput);

  if (!rule) throw new Error("Failed to apply changes");

  info(`Rule ARN: ${rule.RuleArn}`);
  setOutput("rule-arn", rule.RuleArn);

  return 0;
}
