/*******************************************************************************
 * Copyright (c) 2017 Nicola Del Gobbo
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the license at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY
 * IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing
 * permissions and limitations under the License.
 *
 * Contributors - initial API implementation:
 * Nicola Del Gobbo <nicoladelgobbo@gmail.com>
 ******************************************************************************/

'use strict';

/*!
 * Module dependencies
 */
const gs = require('../');

process.chdir(__dirname); 

describe("Test ghostscript4js", function () {

  it("Should return the version of Ghoscript", function () {
      expect(gs.version).not.toThrow();
      const version = gs.version();
      console.log(version);
      expect(version.product).toContain("GPL Ghostscript");
      expect(version.copyright).toContain("Copyright (C) 2016 Artifex Software, Inc.  All rights reserved.");
      expect(version.product).not.toBeLessThan(gs.MIN_SUPPORTED_REVISION);
      expect(version.product).not.toBeLessThan(20160323);
  });

  it("Should execute Ghostscript command synchronous", function () {
    
  });

  it("Should execute Ghostscript command asynchronous", function () {
       
  });

});
