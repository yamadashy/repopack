import pc from 'picocolors';

export function printSummary(totalFiles: number, totalCharacters: number, outputPath: string) {
  console.log(pc.white('📊 Pack Summary:'));
  console.log(pc.dim('────────────────'));
  console.log(`${pc.white('Total Files:')} ${pc.white(totalFiles.toString())}`);
  console.log(`${pc.white('Total Chars:')} ${pc.white(totalCharacters.toString())}`);
  console.log(`${pc.white('     Output:')} ${pc.white(outputPath)}`);
}

export function printSecurityCheck(suspiciousFiles: string[]) {
  console.log(pc.white('🔎 Security Check:'));
  console.log(pc.dim('──────────────────'));

  if (suspiciousFiles.length === 0) {
    console.log(pc.green('✔') + ' ' + pc.white('No suspicious files detected.'));
  } else {
    console.log(pc.yellow(`${suspiciousFiles.length} suspicious file(s) detected:`));
    suspiciousFiles.forEach((file, index) => {
      console.log(`${pc.white(`${index + 1}.`)} ${pc.white(file)}`);
    });
    console.log(pc.yellow('\nPlease review these files for potential sensitive information.'));
  }
}

export function printTopFiles(fileCharCounts: Record<string, number>, topFilesLength: number) {
  console.log(pc.white(`📈 Top ${topFilesLength} Files by Character Count:`));
  console.log(pc.dim('──────────────────────────────────'));

  const topFiles = Object.entries(fileCharCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topFilesLength);

  topFiles.forEach(([filePath, count], index) => {
    const indexString = `${index + 1}.`.padEnd(3, ' ');
    console.log(`${pc.white(`${indexString}`)} ${pc.white(filePath)} ${pc.dim(`(${count} chars)`)}`);
  });
}

export function printCompletion() {
  console.log(pc.green('🎉 All Done!'));
  console.log(pc.white('Your repository has been successfully packed.'));
}
