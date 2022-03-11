# Guido Desktop App

[![Deploy on GitHub pages](https://github.com/ucll-ap-guide/guideApp-desktop/actions/workflows/deploy-to-github-pages.yml/badge.svg?branch=main)](https://github.com/ucll-ap-guide/guideApp-desktop/actions/workflows/deploy-to-github-pages.yml)
[![Build Docker image](https://github.com/ucll-ap-guide/guideApp-desktop/actions/workflows/build-docker-image.yml/badge.svg?branch=main)](https://github.com/ucll-ap-guide/guideApp-desktop/actions/workflows/build-docker-image.yml)

## Requirements

- npm 8.5 and higher (probably also lower versions)

## How to run

⚠ Don't forget to first edit the apiUrl in the `environment.prod.ts` & `environment.ts` file.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### For development

Run `ng serve` for a development server. Navigate to `http://localhost:4200/`. The app will automatically reload if you
change any of the source files.

### Build Docker image

(⚠ Don't forget to start Docker Desktop on Windows)

Use the `docker pull alexandrevryghem/guido-desktop:latest` command to get the latest version of the image (or build it
yourself with the command `docker build -t guido-desktop .`).

To run the image run the command `docker run -d -p PORT:80 alexandrevryghem/guido-desktop:latest` and don't forget to
change the `PORT`.

### Run docker-compose file

Use the `docker pull alexandrevryghem/guido-desktop:latest` command to get the latest version of the image (or build it
yourself with the command `docker build -t guido-desktop .`).

To run the docker-compose file run the command `docker-compose up -d` and don't forget to change the `PORT`
inside the `docker-compose.yml` file.

## How to use GitHub actions

### Deploy on GitHub pages

This action is automatically triggered when new code is pushed on `main` and will update the GitHub page, this doesn't
require any additional setup.

### Build Docker image

This action is automatically triggered when new code is pushed on `main`, this will automatically build a Docker image
and push it to your DockerHub repository. This image can be used to run the project on a production server.

⚠ Don't forget to create the `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets in the repository
`Settings>Secrets>Actions`. The `DOCKER_PASSWORD` can also be an Access Token from DockerHub
