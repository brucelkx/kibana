/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import expect from '@kbn/expect';
import { getCoverageOwner } from '../helpers';
import { OwnershipRule } from '../ownership_config';
import * as path from 'path';
import isGlob from 'is-glob';
// import { rules } from '../ownership_config';

describe(`code ownership helper function(s)`, () => {
  describe(`getCoverageOwner`, () => {
    describe(`when passed a simple path pattern`, () => {
      it(`should should return one team`, () => {
        const rules = [
          {
            files: ['/x-pack/legacy/plugins/reporting', '/x-pack/plugins/reporting'],
            excludeFiles: [],
            codeOwner: '@elastic/kibana-reporting',
            coverageOwner: 'kibana-reporting',
          },
          {
            files: ['/packages/kbn-ui-framework/'],
            excludeFiles: [],
            coverageOwner: 'kibana-design',
          },
          {
            files: [
              '/x-pack/plugins/apm/',
              '/x-pack/test/functional/apps/apm/',
              '/src/legacy/core_plugins/apm_oss/',
              '/src/plugins/apm_oss/',
              '/src/apm.js',
            ],
            excludeFiles: [],
            codeOwner: '@elastic/apm-ui',
            coverageOwner: 'apm-ui',
          },
        ];
        expect(getCoverageTeam('packages/kbn-ui-framework/src/components/bar/bar.js', rules)).to.be(
          'kibana-design'
        );
      });
    });
  });
});

function getCoverageTeam(coveredFilePath, rules) {
  const split = (sep) => (x) => x.split(sep);
  const pipe = (...fns) => fns.reduce((f, g) => (...args) => g(f(...args)));
  const splitF = split('/');
  const dropBlanks = (x) => x !== '';
  const filterBlanks = (xs) => xs.filter(dropBlanks);
  const splitAndDropBlanks = pipe(splitF, filterBlanks);

  const possibles = [];

  for (const rule of rules) {
    const { files } = rule;
    for (const filePattern of files) {
      const xs = splitF(filePattern);
      if (!isGlob(filePattern) && xs.length > 2) {
        const [a, b] = splitAndDropBlanks(filePattern);
        const [x, y] = splitAndDropBlanks(coveredFilePath);
        if (a.includes(x) & b.includes(y)) possibles.push(rule);
      }
    }
  }

  return possibles.length === 1 && possibles[0].coverageOwner;
}
