import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from  'aws-cdk-lib/aws-ecs'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class EcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // refering to existing vpc 
    const vpc = ec2.Vpc.fromLookup(this,'ashuExistingVpc', {
      vpcId: 'vpc-063afa0c24ec80cb8'
    });
    // defining ECS cluster info 
    const cluster = new ecs.Cluster(this,'wally-ecs-cluster',{
      clusterName: 'wally-ecs-bycdk',
      vpc: vpc,
      enableFargateCapacityProviders: true ,
      containerInsights: true // enable cloudwatch monitoring 
    });
    // // add ec2 capacity 
    // cluster.addCapacity('defaultashuScaleGroup',{
    //   instanceType: new ec2.InstanceType("t2.small"),
    //   desiredCapacity: 1, // container instances
    //   minCapacity: 1,
    //   maxCapacity: 5
    // });
    
    const imageTag = this.node.tryGetContext('imageTag');
    if (!imageTag) {
      throw new Error('context variable name is required');
    }

    // task Definition of farget launch type 
    const wallyTaskDef = new ecs.FargateTaskDefinition(this,'wally-frgate-task1',{
      cpu:  256,
      memoryLimitMiB: 512
       
    });
    // adding container info 
    const container = wallyTaskDef.addContainer('wallycdkc1',{
      image: ecs.ContainerImage.fromRegistry('dockerwally/wallybmoweb:${imageTag}'),
      memoryLimitMiB: 256,
      portMappings: [{ containerPort: 80 }]
    });

    // creating security group 
    const ashusecgroup = new ec2.SecurityGroup(this,'ashufirewallgrp',{
      vpc: vpc,
      description: 'allow ingress rules for 80 port'
    });
    ashusecgroup.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(80),'allow http traffic');
    // creating service using above task defintion 

    const service = new ecs.FargateService(this,'ashuECSserviceCDK',{
      cluster,
      taskDefinition: wallyTaskDef,
      serviceName: 'wally-svc-bycdk',
      desiredCount: 1,
      assignPublicIp: true,
      securityGroups: [ashusecgroup]   // attaching security group 
    });
  }
}
