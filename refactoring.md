# Refactoring Steps

| Step                                              | Commit |
|---------------------------------------------------|--------|
| De-couple code                                    | [1](https://github.com/mjhea0/mosiac/commit/3460098ac220eb50dedd414baf780891e0abcbb2)       |
| Modularize code                                   | [1](https://github.com/mjhea0/mosiac/commit/7094cb97c9e84b4542f07bd977bd6fa9e0f2ec5e), [2](https://github.com/mjhea0/mosiac/commit/3460098ac220eb50dedd414baf780891e0abcbb2), [3](https://github.com/mjhea0/mosiac/commit/0f34c48964a17f587f07ca830add537d636763c7),  [4](https://github.com/mjhea0/mosiac/commit/45d94761f58b1119506f50d22da67fc469e3f9ff)|
| Ensure each function does only one thing          | [1](https://github.com/mjhea0/mosiac/commit/3460098ac220eb50dedd414baf780891e0abcbb2)          |
| Ensure each function returns something            | [1](https://github.com/mjhea0/mosiac/commit/3460098ac220eb50dedd414baf780891e0abcbb2)          |
| Lint code                                         | [1](https://github.com/mjhea0/mosiac/commit/6b0e7c5e787c5d75ff368ac65b8aa4157e2150c8)       |
| Improve UX                                        |        |
| Write tests                                       |        |
| Convert the function within a loop to a generator | [1](https://github.com/mjhea0/mosiac/commit/077ed85c08ec64e60a9a76d9b801460825fd6469)       |
| Add better error handling                         |        |
