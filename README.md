# LeetPress

Generate single HTML file for all LeetCode problems (excluding pay-only problems) for printing or off line reading.

## Caution

You should agree LeetCode terms, and use this tool at your own risk. This project doesn't contain any content of LeetCode.

> "Content" means all software, communications, images, sounds, and material perceived or made available from the Applications. Unless otherwise specified in writing, all of our content is owned, controlled, or licensed by us. Content means all software, images, questions, solutions, or any material associated with the service and website. All content is copyrighted under United States copyright laws and/or similar laws of other jurisdictions, protecting it from unauthorized use.

> You agree that all content is our sole and exclusive property. We may use all content for any purpose, including for commercial or promotional use without restriction or compensation to you. You agree not to copy, redistribute, publish or otherwise exploit any Content in violation of the intellectual property rights.

*See <https://leetcode.com/terms/#use_of_services>*

## Build from Source Code

* Install TypeScript: <https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html>
* `npm run build`

## Start to Run LeetPress

* `node out/index.js`

## FAQ

* Q: What to do if LeetCode blocks LeetPress?

  A: LeetPress remember where it breaks, so just start LeetPress again without any additional work. And LeetPress will continue its job.

* Q: Where dose my generated file go?

  A: Your generated file goes `./problems.html` under the current direction where you start LeetPress.

## License

MIT License.
