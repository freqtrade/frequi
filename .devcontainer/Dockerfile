FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:20-bullseye

RUN sudo apt-get update \
    && sudo apt-get install -y vim \
    && sudo apt-get clean

USER node

ENV HOME /home/node

# load ssh key in bash terminal
RUN mkdir -p ${HOME}/commandhistory \
    # && echo "eval \$(ssh-agent) && ssh-add ~/.ssh/id_rsa"  >> ${HOME}/.bashrc \
    # set variable bash history
    && echo "export PROMPT_COMMAND='history -a'" >> ${HOME}/.bashrc \
    && echo "export HISTFILE=~/commandhistory/.bash_history" >> ${HOME}/.bashrc

EXPOSE 3000
