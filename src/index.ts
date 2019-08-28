import * as rq from 'request-promise';
import * as fs from 'fs';

interface ProblemResponse {
  paid_only: boolean;
  stat: {
    question_id: number;
    question__title_slug: string;
  };
}

interface ProblemListResponse {
  stat_status_pairs: ProblemResponse[];
}

interface GraphQL {
  operationName: string;
  query: string;
  variables?: {[key: string]: string};
}

interface ProblemDetailResponse {
  data: {
    question: {
      questionId: number;
      title: string;
      content: string;
      difficulty: string;
    }
  }
}

class LeetPress {
  private static OUTPUT_PATH = './problems.html';
  private static BREAK_LOG_PATH = './break.log';

  private static async _getProblemList(includePayOnly = false) {
    const uri = 'https://leetcode.com/api/problems/all/';
    const response: ProblemListResponse = await rq.get({
      uri,
      json: true,
    });
    
    if (includePayOnly) {
      return response.stat_status_pairs
          .sort((a, b) => a.stat.question_id - b.stat.question_id);
    }
    return response.stat_status_pairs
        .filter(p => !p.paid_only)
        .sort((a, b) => a.stat.question_id - b.stat.question_id);
  }

  private static async _graphql<T>(query: GraphQL) {
    const uri = 'https://leetcode.com/graphql';
    const response: T = await rq.post({
      uri,
      headers: {
        'Content-Type': 'application/json',
      },
      body: query,
      json: true,
    });

    return response;
  }

  private static async _queryProblem(titleSlug: string) {
    const problemGraphQL: GraphQL = {
      operationName: 'questionData',
      variables: {
        titleSlug,
      },
      query: `query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            questionFrontendId
            title
            content
            difficulty
          }
        }`,
    };
    const response = await LeetPress._graphql<ProblemDetailResponse>(problemGraphQL);
    return response;
  }

  private static _openWriteStream() {
    const stream = fs.createWriteStream(LeetPress.OUTPUT_PATH, {
      flags: 'a',
    });
    return stream;
  }

  private static _writeStream(stream: fs.WriteStream, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      stream.write(content + '\r\n', (error) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }

  private static async _writeHtmlHead(stream: fs.WriteStream) {
    const content = `<!DOCTYPE html>
    <html>
    <body>
    <head>
      <base href="https://leetcode.com">
    </head>
    `;
    await LeetPress._writeStream(stream, content);
  }

  private static async _writeHtmlFoot(stream: fs.WriteStream) {
    const content = `</body>
    </html>`;
    await LeetPress._writeStream(stream, content);
  }

  private static async _writeBreakLog(questionId: number) {
    return new Promise((resolve, reject) => {
      fs.writeFile(LeetPress.BREAK_LOG_PATH, questionId.toString(), (error) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }

  private static async _getBreakLog(): Promise<number> {
    return new Promise((resolve, reject) => {
      fs.exists(this.BREAK_LOG_PATH, (exists) => {
        if (exists) {
          fs.readFile(this.BREAK_LOG_PATH, (error, data) => {
            if (error) {
              return reject(error);
            }

            fs.unlink(this.BREAK_LOG_PATH, (error) => {
              if (error) {
                return reject(error);
              }
              return resolve(Number(data.toString()));
            });
          });
        } else {
          fs.exists(LeetPress.OUTPUT_PATH, (exists) => {
            if (exists) {
              fs.unlink(LeetPress.OUTPUT_PATH, (error) => {
                if (error) {
                  return reject(error);
                }
                return resolve(1);
              });
            } else {
              return resolve(1);
            }
          });
        }
      });
    });
  }

  static async run() {
    const startId = await LeetPress._getBreakLog();
    const outPath = './problems.html';
    const stream = LeetPress._openWriteStream();
    if (startId === 1) {
      await LeetPress._writeHtmlHead(stream);
    }
    const problemList = await LeetPress._getProblemList();
    for (const problem of problemList) {
      if (problem.stat.question_id < startId) {
        continue;
      }

      try {
        const problemDetails = await LeetPress._queryProblem(problem.stat.question__title_slug);
        const content = `<h1>${problemDetails.data.question.title}<sup>${problemDetails.data.question.difficulty}</sup></h1>
        ${problemDetails.data.question.content}`;
        await LeetPress._writeStream(stream, content);
        console.log(`${problemDetails.data.question.questionId}. ${problemDetails.data.question.title}`);
      } catch(error) {
        await LeetPress._writeBreakLog(problem.stat.question_id);
        console.log('Error occured. Please open LeetCode with browser to check if problem loads correctly, then run again.');
        throw error;
      }
    }
    await LeetPress._writeHtmlFoot(stream);
    console.log(`Congratulations! All done! Output path: ${outPath}`);
  }
}

LeetPress.run();
