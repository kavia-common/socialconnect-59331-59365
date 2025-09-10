#!/bin/bash
cd /home/kavia/workspace/code-generation/socialconnect-59331-59365/backend_api
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

