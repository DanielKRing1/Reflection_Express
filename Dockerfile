FROM debian:bullseye as builder

ARG NODE_VERSION=18.16.0

RUN apt-get update; apt install -y curl python-is-python3 pkg-config build-essential
RUN curl https://get.volta.sh | bash
ENV VOLTA_HOME /root/.volta
ENV PATH /root/.volta/bin:$PATH
RUN volta install node@${NODE_VERSION}

#######################################################################

RUN mkdir /app
WORKDIR /app

# NPM will not install any package listed in "devDependencies" when NODE_ENV is set to "production",
# to install all modules: "npm install --production=false".
# Ref: https://docs.npmjs.com/cli/v9/commands/npm-install#description

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# MAY NEED THIS LINE ON A FRESH MACHINE
# ----
# RUN npx prisma db push
# ----
# RUN npx prisma generate
# RUN npx prisma migrate dev
# RUN npx prisma migrate deploy

# RUN npm run compile
FROM builder
RUN npm run build
# ENV NODE_PATH=./dist

# FROM builder
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app /app
# COPY --from=builder /app/packages/backend/node_modules/@prisma/client/ ./node_modules/@prisma/client/
# COPY --from=builder /app/packages/backend/node_modules/.prisma/client/ ./node_modules/.prisma/client/
# COPY --from=builder /app/packages/common/dist/ ./node_modules/common/dist/

LABEL fly_launch_runtime="nodejs"

COPY --from=builder /root/.volta /root/.volta
# COPY --from=builder /app /app

WORKDIR /app
RUN ls
# RUN ls node_modules
RUN ls ..
ENV NODE_ENV prod
ENV PATH /root/.volta/bin:$PATH

CMD [ "./start.sh" ]
