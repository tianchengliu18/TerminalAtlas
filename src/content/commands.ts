import type { CommandEntry, CommandFlag, SafetyLevel } from '../model/types'

type Seed = [string, string, string, string, string, string, string]
// command, English meaning (not a claimed official expansion), Chinese title, category, example, summary, safety
const seeds: Seed[] = [
  ['ls','list','列出目录内容','Navigation','ls -lah','查看文件、目录和隐藏项','read_only'],
  ['cd','change directory','切换工作目录','Navigation','cd ~/Projects','进入指定目录','read_only'],
  ['pwd','print working directory','显示当前路径','Navigation','pwd','打印当前工作目录的绝对路径','read_only'],
  ['tree','directory tree','树状展示目录','Navigation','tree -L 2','用层级结构查看目录内容','read_only'],
  ['pushd','push directory','保存并切换目录','Navigation','pushd ~/Projects','把当前目录压栈后切换目录','read_only'],
  ['popd','pop directory','返回保存的目录','Navigation','popd','弹出目录栈并切换目录','read_only'],
  ['mkdir','make directory','创建目录','File Management','mkdir -p notes/2026','创建一个或多个目录','modifies_data'],
  ['touch','touch file','创建文件或更新时间','File Management','touch notes.txt','创建空文件或修改时间戳','modifies_data'],
  ['cp','copy','复制文件','File Management','cp -R source backup','复制文件或目录','modifies_data'],
  ['mv','move','移动或重命名','File Management','mv draft.txt final.txt','移动文件或修改名称','modifies_data'],
  ['rm','remove','删除文件','File Management','rm -i old.txt','移除文件或目录；操作可能不可恢复','high_risk'],
  ['ln','link','创建链接','File Management','ln -s target shortcut','创建硬链接或符号链接','modifies_data'],
  ['file','file type','识别文件类型','File Management','file archive.zip','根据内容判断文件类型','read_only'],
  ['stat','file status','查看文件元数据','File Management','stat notes.txt','显示文件大小、权限和时间信息','read_only'],
  ['du','disk usage','估算目录大小','File Management','du -sh .','统计文件或目录占用的磁盘空间','read_only'],
  ['df','disk free','查看磁盘容量','System','df -h','查看文件系统容量与剩余空间','read_only'],
  ['find','find files','按条件查找文件','Search','find . -name "*.md"','按名称、类型或时间查找路径','read_only'],
  ['grep','global regular expression print','搜索文本内容','Search','grep -Rni "TODO" src','在文件中搜索匹配的行','read_only'],
  ['rg','ripgrep','快速搜索项目文本','Search','rg -n "TODO" src','递归搜索文本并尊重忽略规则','read_only'],
  ['which','which executable','定位命令路径','Shell','which python3','查看将被调用的可执行文件路径','read_only'],
  ['type','shell command type','判断命令来源','Shell','type ls','判断命令是别名、函数还是程序','read_only'],
  ['echo','echo text','输出文本','Shell','echo "$PATH"','在标准输出显示文本或变量','read_only'],
  ['cat','concatenate','读取文件内容','File Management','cat README.md','把文件内容输出到终端','read_only'],
  ['less','pager','分页阅读文本','File Management','less README.md','分页浏览长文件','read_only'],
  ['head','file head','查看文件开头','File Management','head -n 20 app.log','显示文件的前几行','read_only'],
  ['tail','file tail','查看文件末尾','File Management','tail -f app.log','显示末尾内容并可持续跟踪','read_only'],
  ['wc','word count','统计行数与字数','File Management','wc -l README.md','统计行、词和字节数','read_only'],
  ['sort','sort lines','排序文本行','Shell','sort names.txt','按规则排序输入行','read_only'],
  ['uniq','unique lines','合并相邻重复行','Shell','sort names.txt | uniq -c','统计连续重复的行','read_only'],
  ['cut','cut fields','截取列或字符','Shell','cut -d: -f1 /etc/passwd','从每行提取指定字段','read_only'],
  ['awk','pattern scanning language','按字段处理文本','Shell','awk -F, \'{print $1}\' data.csv','逐行按模式处理文本字段','read_only'],
  ['sed','stream editor','流式替换文本','Shell','sed -n \'1,20p\' file.txt','按规则编辑或输出文本流','read_only'],
  ['xargs','build argument lists','把输入转成参数','Shell','printf "%s\\n" a b | xargs echo','将标准输入构造成命令参数','read_only'],
  ['chmod','change mode','修改文件权限','File Management','chmod u+x script.sh','更改文件读写与执行权限','high_risk'],
  ['chown','change owner','修改所有者','File Management','chown user file.txt','更改文件所属用户或组','high_risk'],
  ['ps','process status','查看进程','System','ps aux','列出正在运行的进程','read_only'],
  ['kill','send signal','向进程发送信号','System','kill -TERM 1234','请求进程退出或发送其他信号','high_risk'],
  ['top','process monitor','实时查看进程','System','top','实时查看 CPU 与内存活动','read_only'],
  ['uname','unix name','查看系统信息','System','uname -a','显示内核和系统平台信息','read_only'],
  ['date','date and time','查看日期时间','System','date','输出当前日期与时间','read_only'],
  ['env','environment','查看环境变量','Shell','env','列出当前进程环境变量','read_only'],
  ['export','export variable','导出环境变量','Shell','export EDITOR=vim','使变量对后续子进程可见','modifies_data'],
  ['history','command history','查看命令历史','Shell','history','查看当前 Shell 的历史记录','read_only'],
  ['alias','alias command','定义命令别名','Shell','alias ll="ls -lah"','为常用命令设置简写','modifies_data'],
  ['man','manual','阅读命令手册','Shell','man ls','查看本机命令的完整手册','read_only'],
  ['curl','client URL','发送网络请求','Networking','curl -I https://example.com','请求 URL 并查看响应','read_only'],
  ['ping','network ping','测试网络连通','Networking','ping -c 4 example.com','通过 ICMP 测试主机可达性','read_only'],
  ['ssh','secure shell','安全连接远程主机','Networking','ssh user@example.com','通过加密连接登录远程机器','modifies_data'],
  ['scp','secure copy','安全复制远程文件','Networking','scp file.txt user@host:~/','通过 SSH 复制文件','modifies_data'],
  ['dig','domain information groper','查询 DNS 记录','Networking','dig example.com','查询域名解析记录','read_only'],
  ['lsof','list open files','查看被占用的文件','Troubleshooting','lsof -i :3000','查找打开文件或端口的进程','read_only'],
  ['nc','netcat','检查网络端口','Troubleshooting','nc -vz localhost 3000','连接或探测 TCP/UDP 端口','read_only'],
  ['git status','git status','查看 Git 工作区','Git','git status --short','查看修改、暂存和分支状态','read_only'],
  ['git log','git log','查看提交历史','Git','git log --oneline -5','浏览最近的 Git 提交','read_only'],
  ['git diff','git diff','比较 Git 修改','Git','git diff -- README.md','查看工作区与暂存区差异','read_only'],
  ['git add','git add','暂存文件修改','Git','git add README.md','把指定改动放进暂存区','modifies_data'],
  ['git commit','git commit','创建 Git 提交','Git','git commit -m "Update docs"','保存当前暂存改动的快照','modifies_data'],
  ['git branch','git branch','查看或创建分支','Git','git branch --list','管理本地分支','read_only'],
  ['git switch','git switch','切换 Git 分支','Git','git switch main','切换当前工作分支','modifies_data'],
  ['git restore','git restore','恢复 Git 文件','Git','git restore --staged README.md','恢复工作区或暂存区文件；谨慎使用','high_risk'],
  ['python3','Python interpreter','运行 Python','Python','python3 --version','运行 Python 解释器或脚本','read_only'],
  ['python3 -m venv','virtual environment','创建 Python 虚拟环境','Python','python3 -m venv .venv','隔离项目 Python 依赖','modifies_data'],
  ['pip','Python package installer','管理 Python 包','Python','python3 -m pip list','查看或安装 Python 包','read_only'],
  ['pytest','Python test runner','运行 Python 测试','Python','pytest -q','执行 Python 项目测试','read_only'],
  ['npm','Node package manager','管理 Node 包','npm / Node.js','npm --version','安装或管理 JavaScript 依赖','read_only'],
  ['npm run','package script runner','运行项目脚本','npm / Node.js','npm run build','运行 package.json 中定义的脚本','read_only'],
  ['node','Node.js runtime','运行 JavaScript','npm / Node.js','node --version','运行 Node.js 程序','read_only'],
  ['npx','npm package executor','临时运行包命令','npm / Node.js','npx vite --version','运行 npm 包提供的命令','read_only'],
  ['tar','tape archive','打包或解包归档','File Management','tar -tf archive.tar','查看 tar 归档中的文件','read_only'],
  ['zip','zip archive','创建 ZIP 归档','File Management','zip -r backup.zip notes','压缩文件或目录为 ZIP','modifies_data'],
  ['unzip','unzip archive','解压 ZIP 归档','File Management','unzip -l backup.zip','列出 ZIP 包中的内容','read_only'],
  ['open','open file','用默认应用打开','System','open README.md','在 macOS 用默认应用打开文件','read_only'],
  ['pbcopy','pasteboard copy','复制到剪贴板','System','echo hello | pbcopy','把标准输入复制到 macOS 剪贴板','modifies_data'],
  ['pbpaste','pasteboard paste','读取剪贴板','System','pbpaste','输出 macOS 剪贴板内容','read_only'],
]

const rich: Record<string, { flags: [string,string,string?][]; combo?: [string,string,string[]]; note?: string; related?: string[] }> = {
  ls: { flags: [['-l','以长列表格式显示权限、大小和时间','long listing'],['-a','包含以点号开头的隐藏项','all entries'],['-h','与长列表搭配，以易读单位显示大小','human-readable sizes']], combo: ['ls -lah','以长列表格式显示所有项目，包括隐藏项，并以易读单位显示大小',['-l','-a','-h']], note: '`ls` 与 list（列出）相关；这里显示的是英文含义，而非强制认定的官方全称。', related:['cd','pwd','find'] },
  cd: { flags: [['..','上一级目录'],['~','用户主目录'],['-','上一次工作目录']], related:['pwd','ls','pushd'] },
  mkdir: { flags: [['-p','按需建立中间目录，已存在时不报错','parents'],['-v','输出创建的目录名称','verbose']], combo:['mkdir -pv notes/2026','建立路径中缺失的目录并显示创建过程',['-p','-v']] },
  cp: { flags: [['-R','递归复制目录','recursive'],['-i','覆盖前询问','interactive'],['-v','显示复制过程','verbose']], combo:['cp -Riv source backup','递归复制并在覆盖前询问，同时显示过程',['-R','-i','-v']] },
  mv: { flags: [['-i','覆盖前询问','interactive'],['-n','不覆盖已存在的目标','no clobber'],['-v','显示移动过程','verbose']], combo:['mv -iv old new','覆盖前询问并显示移动过程',['-i','-v']] },
  rm: { flags: [['-i','逐项询问是否删除','interactive'],['-r','递归删除目录内容','recursive'],['-f','强制删除且不提示','force']], combo:['rm -ri old-dir','递归删除并逐项确认；请先核对目标路径',['-r','-i']] },
  find: { flags: [['-name','按区分大小写的名称模式匹配'],['-type f','仅匹配普通文件'],['-mtime','按修改日期筛选']], combo:['find . -type f -name "*.md"','在当前目录下查找 Markdown 普通文件',['-type f','-name']] },
  grep: { flags: [['-R','递归搜索目录','recursive'],['-n','显示行号','line number'],['-i','忽略大小写','ignore case']], combo:['grep -Rni "TODO" src','递归搜索 src，忽略大小写并显示行号',['-R','-n','-i']] },
  rg: { flags: [['-n','显示行号'],['-i','忽略大小写'],['-g','按 glob 限定文件']], combo:['rg -ni "TODO" src','搜索 src 中包含 TODO 的行，忽略大小写并显示行号',['-n','-i']] },
  du: { flags: [['-s','仅给出汇总','summarize'],['-h','以易读单位显示','human-readable']], combo:['du -sh .','以易读单位显示当前目录总大小',['-s','-h']] },
  df: { flags: [['-h','以易读单位显示容量'],['-i','显示 inode 用量']], combo:['df -h','显示各文件系统的易读容量',['-h']] },
  tail: { flags: [['-n','指定显示行数'],['-f','持续跟踪追加内容']], combo:['tail -n 50 -f app.log','先显示最后 50 行，再持续跟踪新内容',['-n','-f']] },
  wc: { flags: [['-l','统计行数'],['-w','统计词数'],['-c','统计字节数']], combo:['wc -l README.md','统计 README 的行数',['-l']] },
  ps: { flags: [['a','显示其他用户的进程'],['u','显示面向用户的详细格式'],['x','包含无控制终端的进程']], combo:['ps aux','查看所有用户的详细进程列表，包括后台进程',['a','u','x']] },
  curl: { flags: [['-I','仅获取响应头'],['-L','跟随重定向'],['-o','将响应写入指定文件']], combo:['curl -IL https://example.com','跟随重定向并查看最终响应头',['-I','-L']] },
  ping: { flags: [['-c','发送指定数量的请求'],['-W','指定等待时间；单位随平台而异']], combo:['ping -c 4 example.com','发送四次 ICMP 请求后停止',['-c']] },
  ssh: { flags: [['-p','指定远程 SSH 端口'],['-i','指定私钥文件'],['-v','输出诊断日志']], combo:['ssh -p 2222 user@host','使用 2222 端口连接远程主机',['-p']] },
  'git status': { flags: [['--short','显示紧凑状态'],['--branch','显示分支信息']], combo:['git status --short --branch','用紧凑格式查看改动和当前分支',['--short','--branch']] },
  'git log': { flags: [['--oneline','每条提交显示一行'],['-n','限制提交数量'],['--graph','绘制文本提交图']], combo:['git log --oneline --graph -5','以文本图形显示最近五条提交',['--oneline','--graph','-5']] },
  'git diff': { flags: [['--staged','比较暂存区与上次提交'],['--stat','显示更改摘要'],['--','把后续参数视为路径']], combo:['git diff --staged --stat','显示已暂存修改的文件摘要',['--staged','--stat']] },
  'git add': { flags: [['-p','交互式选择变更块'],['-A','暂存所有改动，包括删除']], combo:['git add -p','逐块选择要暂存的改动',['-p']] },
  'git commit': { flags: [['-m','直接提供提交说明'],['--amend','修改最近一次提交；协作时谨慎']], combo:['git commit -m "Update docs"','用指定说明创建提交',['-m']] },
  chmod: { flags: [['u+x','给文件所有者增加执行权限'],['-R','递归更改目录权限']], combo:['chmod u+x script.sh','只为文件所有者增加执行权限',['u+x']] },
  lsof: { flags: [['-i','筛选网络连接或端口'],['-n','不解析网络地址'],['-P','不将端口转服务名']], combo:['lsof -nP -i :3000','不解析名称，查找占用 3000 端口的进程',['-n','-P','-i']] },
}

const macOnly = new Set(['open','pbcopy','pbpaste'])
const highRisk = new Set(['rm','chmod','chown','kill','git restore'])
const syntax:Record<string,string>={
  ls:'ls [options] [directory]',cd:'cd [directory]',pwd:'pwd [-L | -P]',mkdir:'mkdir [options] directory…',
  cp:'cp [options] source destination',mv:'mv [options] source destination',rm:'rm [options] path…',
  find:'find [path…] [expression]',grep:'grep [options] pattern [file…]',rg:'rg [options] pattern [path…]',
  du:'du [options] [path…]',df:'df [options] [file…]',tail:'tail [options] [file…]',wc:'wc [options] [file…]',
  ps:'ps [options]',curl:'curl [options] URL',ping:'ping [options] host',ssh:'ssh [options] destination [command]',
  'git status':'git status [options]', 'git log':'git log [options]', 'git diff':'git diff [options] [--] [path…]',
  'git add':'git add [options] [--] path…','git commit':'git commit [options]',chmod:'chmod [options] mode file…',
  lsof:'lsof [options] [names]',cat:'cat [file…]',head:'head [options] [file…]',man:'man [section] command',
}
const platformNotes:Record<string,string>={
  ls:'macOS 使用 BSD ls；GNU 长选项（如 --all）在 macOS 默认 ls 中通常不可用。这里的 -l、-a、-h 可用于两者。',
  grep:'macOS 的 BSD grep 与 GNU grep 在扩展选项上存在差异；请以本机 man grep 为准。',
  du:'macOS 与 GNU du 的扩展长选项不同；示例中的 -s、-h 是两者常见的短选项。',
  df:'macOS 的 df 选项和 Linux GNU df 并不完全相同；优先查看本机 man df。',
  ping:'macOS 与 Linux 的 -W 等超时参数单位不同；这里仅使用两者共有的 -c 示例。',
  sed:'macOS BSD sed 与 GNU sed 的原地编辑 -i 语法不同；本示例只读取并输出内容。',
  date:'macOS BSD date 与 GNU date 的格式化和解析选项不同。',
  ps:'macOS 与 Linux 的进程字段和扩展选项不同；ps aux 是两者常见用法。',
}

function makeEntry([command, meaningEn, titleZh, category, example, summaryZh, safetyText]: Seed): CommandEntry {
  const detail = rich[command]
  const id = command.replaceAll(' ', '-')
  const safety = (highRisk.has(command) ? 'high_risk' : safetyText) as SafetyLevel
  const platforms = macOnly.has(command) ? ['macos' as const] : ['macos' as const, 'linux' as const]
  return {
    id, command, meaningEn, titleZh, summaryZh, syntax: syntax[command]??command + ' [options] [arguments]',platformNote:platformNotes[command],
    category, tags: [category.toLowerCase().replaceAll(' ', '-'), safety === 'read_only' ? 'read-only' : 'changes-data'],
    searchAliasesZh: command === 'ls' ? ['查看隐藏文件','列出文件','查看文件'] : [],
    platforms, safety,
    flags: (detail?.flags ?? []).map(([token, descriptionZh, descriptionEn]): CommandFlag => ({token, descriptionZh, descriptionEn})),
    combinations: detail?.combo ? [{expression: detail.combo[0], explanationZh: detail.combo[1], tokens: detail.combo[2]}] : [],
    examples: [{titleZh: '常用示例', commandLine: example, explanationZh: summaryZh, platforms, safety}],
    relatedCommandIds: (detail?.related ?? []).map(x => x.replaceAll(' ', '-')),
    markdownBody: detail?.note ?? '',
    source: {provider:'original', license:'CC BY-NC 4.0', modified:false},
  }
}

const tldrRevision='e9fa68b4b42abaa5bec58a6c7ba87f185a535b6d'
const tldrPages=import.meta.glob('../../handbook/imported-tldr/*.md',{query:'?raw',import:'default',eager:true}) as Record<string,string>
const tldrByName=new Map(Object.entries(tldrPages).map(([path,body])=>[path.split('/').at(-1)!.replace('.md',''),body]))
export const baseCommands: CommandEntry[] = seeds.map(seed=>{
  const entry=makeEntry(seed)
  const original=tldrByName.get(entry.command)
  if(!original)return entry
  return {...entry,markdownBody:[entry.markdownBody,'### tldr-pages English reference',original].filter(Boolean).join('\n\n'),
    source:{provider:'tldr-pages',url:`https://github.com/tldr-pages/tldr/blob/${tldrRevision}/pages/common/${entry.command}.md`,upstreamPath:`pages/common/${entry.command}.md`,revision:tldrRevision,license:'CC BY 4.0',modified:true}}
})
export const categories = [...new Set(baseCommands.map(command => command.category))]
