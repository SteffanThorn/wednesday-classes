'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { ChevronLeft, Loader2, Sparkles, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminLeadsPage() {
	const { language, mounted } = useLanguage();
	const { data: session, status } = useSession();
	const router = useRouter();
	const [forceZhMode, setForceZhMode] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const savedLanguage = String(window.localStorage.getItem('language') || '').toLowerCase();
		const browserLanguage = String(window.navigator?.language || '').toLowerCase();
		const shouldUseZh =
			savedLanguage === 'zh' ||
			savedLanguage === 'cn' ||
			savedLanguage.startsWith('zh-') ||
			savedLanguage.startsWith('zh_') ||
			browserLanguage.startsWith('zh');

		setForceZhMode(shouldUseZh);
	}, [language, mounted]);

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/auth/signin');
			return;
		}

		if (status === 'authenticated' && session?.user?.role !== 'admin') {
			router.push('/dashboard');
		}
	}, [status, session, router]);

	const isZh = language !== 'en' || forceZhMode;
	const txt = (zh, en) => (isZh ? zh : en);

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
					<div className="max-w-4xl mx-auto">
						<Link
							href="/admin"
							className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-glow-cyan transition-colors mb-6"
						>
							<ChevronLeft className="w-4 h-4" />
							{txt('返回管理后台', 'Back to admin dashboard')}
						</Link>

						<div className="rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm p-8 md:p-10">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-12 h-12 rounded-2xl bg-glow-cyan/10 border border-glow-cyan/20 flex items-center justify-center">
									<Users className="w-6 h-6 text-glow-cyan" />
								</div>
								<div>
									<h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle">
										{txt('潜在客户', 'Potential Leads')}
									</h1>
									<p className="text-muted-foreground mt-1">
										{txt('该页面已恢复为可访问状态，避免影响后台上线部署。', 'This page is restored so admin deployment is no longer blocked.')}
									</p>
								</div>
							</div>

							<div className="rounded-2xl border border-white/10 bg-black/20 p-5 md:p-6 space-y-4">
								<div className="flex items-start gap-3">
									<Sparkles className="w-5 h-5 text-glow-cyan mt-0.5" />
									<div>
										<p className="text-foreground font-medium">
											{txt('当前状态', 'Current status')}
										</p>
										<p className="text-sm text-muted-foreground mt-1">
											{txt(
												'原来的潜在客户页面文件为空，生产构建时会报错。现在已补上占位页，确保预约管理等功能可以继续正常发布。',
												'The original leads page was empty and caused the production build to fail. A placeholder page is now in place so bookings and the rest of admin can deploy normally.'
											)}
										</p>
									</div>
								</div>

								<div className="flex flex-wrap gap-3 pt-2">
									<Link
										href="/admin/bookings"
										className="px-4 py-2 rounded-xl bg-glow-cyan/15 border border-glow-cyan/30 text-glow-cyan text-sm hover:bg-glow-cyan/25 transition-colors"
									>
										{txt('前往预约管理', 'Open bookings')}
									</Link>
									<Link
										href="/admin/customers"
										className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm hover:bg-white/10 transition-colors"
									>
										{txt('查看客户资料', 'View customers')}
									</Link>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
