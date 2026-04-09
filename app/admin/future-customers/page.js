'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import {
  AlertTriangle,
  ChevronRight,
  FileUp,
  Loader2,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const DEMO_TEMPLATE = [
  'name,email,phone,notes',
  '张三,zhangsan@example.com,0211234567,以前上过流瑜伽',
  '李四,lisi@example.com,+64 21 765 432,可优先联系周三课程',
].join('\n');

function normalizeError(payload, fallbackMessage) {
  if (!payload) return fallbackMessage;
  if (typeof payload === 'string') return payload;
  return payload.error || payload.message || fallbackMessage;
}

export default function AdminFutureCustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [rawText, setRawText] = useState('');
  const [source, setSource] = useState('legacy-members');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchList();
    }
  }, [status, session]);

  const counts = useMemo(() => {
    if (!preview?.summary) return null;
    return preview.summary;
  }, [preview]);

  async function fetchList() {
    setLoadingList(true);
    try {
      const res = await fetch('/api/admin/future-customers');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(normalizeError(data, 'Failed to load future customers'));
      }
      setList(data.customers || []);
    } catch (apiError) {
      setError(apiError.message || 'Failed to load future customers');
    } finally {
      setLoadingList(false);
    }
  }

  async function runImport(confirmOverlap = false) {
    if (!rawText.trim()) {
      setError('请先粘贴客户信息（CSV 文本）后再导入。');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/admin/future-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          source,
          confirmOverlap,
        }),
      });
      const data = await res.json();

      if (res.status === 409 && data.needsConfirmation) {
        setPreview(data);
        setMessage('检测到和现有客户重叠，请确认后自动清理重复信息并继续导入。');
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(normalizeError(data, 'Import failed'));
      }

      setPreview(data);
      setMessage('导入完成。系统已自动跳过重复数据，并在确认后清理与现有客户重叠的信息。');
      await fetchList();
    } catch (apiError) {
      setError(apiError.message || 'Import failed');
    } finally {
      setBusy(false);
    }
  }

  async function removeOne(id) {
    if (!window.confirm('确认删除该名单记录吗？')) return;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/admin/future-customers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(normalizeError(data, 'Delete failed'));
      }

      setMessage('已删除该客户记录。');
      await fetchList();
    } catch (apiError) {
      setError(apiError.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  async function onUploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setRawText(text);
      setMessage(`已读取文件：${file.name}`);
      setError('');
    } catch {
      setError('文件读取失败，请改为复制粘贴文本。');
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-glow-cyan animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />

        <section className="px-6 pt-8 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center gap-2 text-sm">
              <Link href="/admin" className="text-muted-foreground hover:text-glow-cyan transition-colors">
                管理后台 / Admin Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-glow-cyan">未来客户管理名单 / Future Customer List</span>
            </div>

            <div className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-2">
                未来客户管理名单 / Future Customer Management
              </h1>
              <p className="text-muted-foreground">
                用于管理以前上课但暂时未回来的老客户。上传后会先检查是否与现有客户重叠，确认后自动清理重复信息。
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 p-4 rounded-lg bg-glow-cyan/10 border border-glow-cyan/20 text-glow-cyan text-sm">
                {message}
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="rounded-2xl border border-glow-cyan/20 bg-card/60 p-5 space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-glow-cyan" />
                  上传老客户资料 / Import Legacy Customers
                </h2>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">导入来源标签 / Source</label>
                  <input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-card/70 border border-glow-cyan/20 focus:outline-none focus:border-glow-cyan/50 text-sm"
                    placeholder="例如：legacy-members-apr-2026"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">导入文本（CSV）</label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full h-64 px-3 py-2 rounded-lg bg-card/70 border border-glow-cyan/20 focus:outline-none focus:border-glow-cyan/50 text-sm"
                    placeholder={DEMO_TEMPLATE}
                  />
                  <p className="text-xs text-muted-foreground">
                    格式示例：name,email,phone,notes（第一行可带表头）
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <label className="px-4 py-2 rounded-lg bg-card/70 border border-glow-cyan/20 hover:border-glow-cyan/40 text-sm text-foreground cursor-pointer inline-flex items-center gap-2 transition-colors">
                    <FileUp className="w-4 h-4 text-glow-cyan" />
                    上传 CSV/TXT 文件
                    <input type="file" accept=".csv,.txt" className="hidden" onChange={onUploadFile} />
                  </label>

                  <button
                    onClick={() => runImport(false)}
                    disabled={busy}
                    className="px-4 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-60 text-sm transition-colors"
                  >
                    {busy ? '处理中...' : '预检并导入'}
                  </button>

                  {preview?.needsConfirmation && (
                    <button
                      onClick={() => runImport(true)}
                      disabled={busy}
                      className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 disabled:opacity-60 text-sm transition-colors inline-flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      确认后自动清理并导入
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-glow-cyan/20 bg-card/60 p-5">
                <h2 className="text-lg font-semibold text-foreground mb-3">预检结果 / Preview</h2>

                {!counts ? (
                  <p className="text-sm text-muted-foreground">
                    上传后这里会显示：无效行、上传内重复、与现有客户重叠、与未来名单重复，以及最终可导入数量。
                  </p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between rounded-lg bg-card/70 px-3 py-2 border border-glow-cyan/10">
                      <span>有效行 / Valid rows</span>
                      <span className="text-glow-cyan">{counts.totalValidRows}</span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-card/70 px-3 py-2 border border-glow-cyan/10">
                      <span>无效行 / Invalid rows</span>
                      <span className="text-red-300">{counts.invalidRows}</span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-card/70 px-3 py-2 border border-glow-cyan/10">
                      <span>上传内重复 / Duplicates in upload</span>
                      <span className="text-yellow-300">{counts.duplicatesInUpload}</span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-card/70 px-3 py-2 border border-glow-cyan/10">
                      <span>与现有客户重叠 / Overlap with active</span>
                      <span className="text-amber-200">{counts.overlapWithActive}</span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-card/70 px-3 py-2 border border-glow-cyan/10">
                      <span>与未来名单重复 / Overlap with future list</span>
                      <span className="text-yellow-300">{counts.overlapWithFutureList}</span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-card/70 px-3 py-2 border border-glow-cyan/10">
                      <span>最终导入 / Imported</span>
                      <span className="text-green-300">{counts.imported ?? counts.readyToImport ?? 0}</span>
                    </div>
                    {typeof counts.cleanedFutureDuplicates === 'number' && (
                      <div className="flex justify-between rounded-lg bg-card/70 px-3 py-2 border border-glow-cyan/10">
                        <span>已清理重复 / Cleaned duplicates</span>
                        <span className="text-glow-cyan">{counts.cleanedFutureDuplicates}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-glow-cyan/20 bg-card/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-glow-cyan/10 flex items-center justify-between">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-glow-cyan" />
                  已保存名单 / Saved Future Customers
                </h2>
                <span className="text-xs text-muted-foreground">共 {list.length} 条</span>
              </div>

              {loadingList ? (
                <div className="p-10 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-glow-cyan animate-spin" />
                </div>
              ) : list.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground text-sm">暂无记录，上传后会出现在这里。</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glow-cyan/10 bg-glow-cyan/5">
                        <th className="text-left px-4 py-3 font-medium text-glow-cyan">姓名</th>
                        <th className="text-left px-4 py-3 font-medium text-glow-cyan">邮箱</th>
                        <th className="text-left px-4 py-3 font-medium text-glow-cyan">电话</th>
                        <th className="text-left px-4 py-3 font-medium text-glow-cyan">备注</th>
                        <th className="text-left px-4 py-3 font-medium text-glow-cyan">来源</th>
                        <th className="text-left px-4 py-3 font-medium text-glow-cyan">添加时间</th>
                        <th className="text-center px-4 py-3 font-medium text-glow-cyan">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((item) => (
                        <tr key={item.id} className="border-b border-glow-cyan/10 hover:bg-glow-cyan/5 transition-colors">
                          <td className="px-4 py-3 text-foreground">{item.name}</td>
                          <td className="px-4 py-3 text-muted-foreground break-all">{item.email || '-'}</td>
                          <td className="px-4 py-3 text-foreground">{item.phone || '-'}</td>
                          <td className="px-4 py-3 text-muted-foreground max-w-[320px]">{item.notes || '-'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.source || '-'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeOne(item.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 transition-colors text-xs"
                              disabled={busy}
                            >
                              <Trash2 className="w-3 h-3" />
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
