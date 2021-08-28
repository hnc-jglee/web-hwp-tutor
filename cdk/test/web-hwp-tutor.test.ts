import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as WebHwpTutor from '../lib/web-hwp-tutor-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new WebHwpTutor.WebHwpTutorStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
