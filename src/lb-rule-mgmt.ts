import * as fs from "fs";
import { parse as parseYaml } from "yaml";

import ELBv2, {
  Rule,
  Actions,
  TagList,
  RulePriority,
  CreateRuleInput,
  RuleConditionList,
} from "aws-sdk/clients/elbv2";

export interface ConfigureLoadBalancerRuleInput {
  tags?: string;
  actions?: string;
  listener: string;
  priority?: string;
  conditions?: string;
}

function getClient(): ELBv2 {
  return new ELBv2({
    customUserAgent: "icalia-actions/aws-action",
    region: process.env.AWS_DEFAULT_REGION,
  });
}

function parseData(data: string): any {
  // parseYaml takes care of both YAML and JSON strings
  return parseYaml(data || "null");
}

function readData(filePath: string): any {
  const contents = fs.readFileSync(filePath, "utf8");
  return parseData(contents);
}

function processData(data: string): any {
  if (!data) return;
  if (fs.existsSync(data)) return readData(data);
  return parseData(data);
}

function processConditions(conditions: string): RuleConditionList {
  return processData(conditions) as RuleConditionList;
}

function processActions(actions: string): Actions {
  return processData(actions) as Actions;
}

function processTags(tags: string): TagList {
  return processData(tags) as TagList;
}

async function processPriority(
  priorityInput: string | undefined,
  listener: string
): Promise<RulePriority> {
  const priority = priorityInput ? parseInt(priorityInput) : NaN;
  if (!isNaN(priority)) return priority as RulePriority;

  const params = { ListenerArn: listener };
  let Rules,
    NextMarker,
    lowestPriority = 1;
  const client = getClient();

  do {
    ({ Rules, NextMarker } = await client.describeRules(params).promise());
    lowestPriority = (Rules || [])
      .map((rule) => rule.Priority)
      .reduce((accum, curr) => {
        if (!curr) return accum;

        const currentPriority = parseInt(curr);
        if (isNaN(currentPriority)) return accum;

        return currentPriority > accum ? currentPriority : accum;
      }, lowestPriority);
  } while (NextMarker);

  return (lowestPriority + 1) as RulePriority;
}

export async function configureLoadBalancerRule(
  input: ConfigureLoadBalancerRuleInput
): Promise<Rule | undefined> {
  const { tags, actions, listener, priority, conditions } = input;

  const ruleData = {
    ListenerArn: listener,
    Priority: await processPriority(priority, listener),
  } as CreateRuleInput;

  if (tags) ruleData.Tags = processTags(tags);
  if (actions) ruleData.Actions = processActions(actions);
  if (conditions) ruleData.Conditions = processConditions(conditions);

  const client = getClient();
  const { Rules } = await client.createRule(ruleData).promise();

  return Rules?.pop();
}
