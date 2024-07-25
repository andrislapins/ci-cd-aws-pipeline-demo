import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { MyPipelineAppStage } from './stage';

export class CiCdAwsPipelineDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'TestPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('andrislapins/ci-cd-aws-pipeline-demo', 'main'),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ]
      }),
    });

    const testingStage = pipeline.addStage(new MyPipelineAppStage(this, "test", {
      env: { account: "471112548576", region: "eu-north-1" }
    }));

    testingStage.addPost(new ManualApprovalStep('Manual approval before production'));

    const prodStage = pipeline.addStage(new MyPipelineAppStage(this, "prod", {
      env: { account: "471112548576", region: "eu-north-1" }
    }));
  }
}
