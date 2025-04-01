// @ts-check
import { execSync } from 'child_process';
import semver from 'semver';

determineNextVersion();

function determineNextVersion() {
    const tagPrefix = 'release/mnestix-browser-v';
    const lastReleaseTagOnBranch = execSync(`git describe --tags --match "${tagPrefix}*" --abbrev=0`).toString().trim();
    const lastReleaseOnBranch = lastReleaseTagOnBranch.replace(tagPrefix, '');
    const commits = execSync(`git log --format="%H%n%s%n%b%n~~~" ${lastReleaseTagOnBranch}..HEAD`)
        .toString()
        .split('~~~\n')
        .map((e) => e.trim())
        .filter((e) => e.length);

    const parsedCommits = commits
        .map((e) => {
            try {
                return parseCommit(e);
            } catch (error) {
                console.error('Skipping commit.', error);
                return null;
            }
        })
        .filter((e) => e !== null);

    if (parsedCommits.find((e) => e.isBreaking)) {
        console.log(semver.inc(lastReleaseOnBranch, 'major'));
        return;
    }

    if (parsedCommits.find((e) => ['feat'].includes(e.type))) {
        console.log(semver.inc(lastReleaseOnBranch, 'minor'));
        return;
    }

    console.log(semver.inc(lastReleaseOnBranch, 'patch'));
}

/**
 *
 * @param {string} commit
 */
function parseCommit(commit) {
    const [hash, subject, body] = commit.split('\n');

    const conventionalCommitRegex = /^(?<type>[a-z]+)(\((?<scope>[\w\-\ ]+)\))?(!)?: (?<message>.+)$/;

    if (subject.startsWith('Merge')) {
        return null;
    }

    const match = conventionalCommitRegex.exec(subject);
    if (!match || !match.groups) {
        throw new Error(`Invalid commit format: ${subject}`);
    }

    const type = match.groups.type;
    const scope = match.groups.scope || null;
    const isBreaking = body?.includes('BREAKING CHANGE:') || subject.includes('!');

    return {
        hash: hash.trim(),
        type,
        isBreaking,
        scope,
        msg: match.groups.message,
        body,
        subject: subject.split(':').slice(1).join(':').trim(),
    };
}
