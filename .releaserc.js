const imageName = 'mnestix/mnestix-browser';

/**
 * @type {import('semantic-release').GlobalConfig}
 */
const config = {
    tagFormat: 'release/mnestix-browser-v${version}',
    branches: ['main'],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        [
            '@semantic-release/exec',
            {
                publishCmd: `\
            docker buildx build \
              --platform linux/amd64,linux/arm64 \
              --target=production \
              --cache-from=type=local,src=/tmp/buildx-amd64-cache \
              --cache-from=type=local,src=/tmp/buildx-arm64-cache \
              -t ${imageName}:\${nextRelease.version} \
              -t ${imageName}:latest \
              --push . \
              `,
            },
        ],
        [
            '@semantic-release/github',
            {
                releaseNameTemplate: '<%= nextRelease.version %>',
            },
        ],
    ],
};

export default config;
