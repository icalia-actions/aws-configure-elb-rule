# AWS Configure ELB Rule

Configures a given ELB Rule

## Usage

```yaml
      - name: Configure AWS ELB Rule
        uses: icalia-actions/aws-configure-elb-rule@v0.0.1
        with:
          listener: arn:YOUR_LISTENER_ARN
          
          # You can define the conditions, actions and tags using JSON or YAML:
          conditions: |  
            - Field: host-header
              HostHeaderConfig:
                Values:
                  - subdomain1.your-domain.tld
                  - subdomain2.your-domain.tld
          actions: |
            - Type: forward
              TargetGroupArn: arn:YOUR_TARGET_GROUP_ARN
          
          # You can optionally set a priority. By default, we'll get the lowest
          # priority and set a lower priority than that:
          priority: 15

          tags: |
            - Key: app
              Value: my-app
            - Key: environment
              Value: development
            - Key: pull-request-node-id
              Value: A_NODE_ID_FROM_GITHUB
```

### Using template files instead:

You can also use an optional json or yaml files for `conditions`, `actions` and
`tags` like this:

```yaml
# tmp/example-conditions.yml
- Field: host-header
  HostHeaderConfig:
    Values:
      - subdomain1.your-domain.tld
      - subdomain2.your-domain.tld
```

```yaml
# tmp/example-actions.yml
- Type: forward
  TargetGroupArn: arn:YOUR_TARGET_GROUP_ARN
```

```yaml
      - name: Configure AWS ELB Rule
        uses: icalia-actions/aws-configure-elb-rule@v0.0.1
        with:
          listener: arn:YOUR_LISTENER_ARN
          conditions: tmp/example.yml
          actions: tmp/example-actions.yml
```