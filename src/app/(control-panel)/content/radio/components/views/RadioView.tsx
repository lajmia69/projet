'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { useRadio } from '../../api/hooks/radio/useRadios';
import useUser from '@auth/useUser';
import FuseLoading from '@fuse/core/FuseLoading';
import Player from '@/components/Player';
import useThemeMediaQuery from '../../../../../../@fuse/hooks/useThemeMediaQuery';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DurationDisplay from '../ui/DurationDisplay';
// Palette: #112468 Deep navy | #1764C0 Royal blue | #0EA8B0 Ocean teal
//          #1DC98A Seafoam   | #2AE88E Mint green | #0D1A47 Midnight navy

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.vars.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function safeTranscription(raw: unknown): {
	language_orientation: string;
	content: Array<{
		index: number;
		type: string;
		paragraph: number;
		is_new_paragraph: boolean;
		text: string;
		speaker: string;
		time: string;
		timestamp: number;
	}>;
} {
	if (!raw || typeof raw !== 'object') {
		return { language_orientation: 'ltr', content: [] };
	}

	const t = raw as Record<string, unknown>;

	return {
		...t,
		language_orientation:
			typeof t.language_orientation === 'string' ? t.language_orientation : 'ltr',
		content: Array.isArray(t.content) ? t.content : [],
	} as ReturnType<typeof safeTranscription>;
}

interface RadioViewProps {
	radioId: string;
}

function RadioView({ radioId }: RadioViewProps) {
	const { data: account } = useUser();

	const accountId = account?.id ?? '';
	const accessToken = account?.token?.access ?? '';

	const { data: radio, isLoading } = useRadio(accountId, radioId, accessToken);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	if (!account || isLoading) {
		return <FuseLoading />;
	}

	if (!radio) {
		return (
			<Root
				scroll={isMobile ? 'page' : 'content'}
				header={
					<div className="p-6">
						<Typography variant="h6">Radio program not found</Typography>
					</div>
				}
				content={
					<div className="flex flex-1 items-center justify-center py-16">
						<Typography color="text.disabled">
							This radio program could not be loaded.
						</Typography>
					</div>
				}
			/>
		);
	}

	const transcription = safeTranscription(radio.transcription);
	const langOrientation = transcription.language_orientation;
	const hasContent = transcription.content.length > 0;

	function getSteps() {
		const content = radio?.transcription?.content;
		if (!content || !Array.isArray(content) || content.length === 0) return [];
		return content.map((c: any) => ({
			index: (c?.index ?? 1) - 1,
			languageOrientation: radio?.transcription?.language_orientation ?? 'ltr',
			speaker: c?.speaker ?? '',
			time: c?.time ?? '',
			timestamp: c?.timestamp ?? 0,
			text: c?.text ?? '',
		}));
	}

	const audioSrc = radio.hd_version?.src || radio.streaming_version?.src || null;
	const audioTimestamp = radio.hd_version?.timestamp ?? radio.streaming_version?.timestamp ?? 0;
	const audioDuration = radio.streaming_version?.duration || radio.hd_version?.duration || null;

	return (
		<Root
			scroll={isMobile ? 'page' : 'content'}

			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4">
					{radio.description && (
						<>
							<Typography color="text.secondary" className="text-sm mb-4">
								{radio.description}
							</Typography>
							<Divider className="mb-4" />
						</>
					)}

					{audioSrc ? (
						<Player
							steps={getSteps()}
							playlist={[
								{ src: radio.hd_version?.src || radio.streaming_version?.src, timestamp: radio.hd_version?.timestamp ?? 0 },
							]}
							transcription={transcription as any}
						/>
					) : (
						<div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
							<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>
								lucide:audio-lines
							</FuseSvgIcon>
							<Typography color="text.secondary" variant="h6">
								No audio available yet
							</Typography>
							<Typography color="text.disabled" variant="body2">
								Audio will appear here once it has been uploaded and processed.
							</Typography>

							{hasContent && (
								<div
									dir={langOrientation}
									className="mt-6 w-full max-w-2xl space-y-3 rounded-xl border border-dashed p-6"
									style={{ borderColor: 'rgba(23,100,192,0.2)' }}
								>
									{/* Accent top stripe */}
									<div style={{ height: 3, width: '60px', background: 'linear-gradient(90deg, #0EA8B0, #1DC98A)', borderRadius: '2px', marginBottom: '12px' }} />
									<Typography
										variant="subtitle2"
										color="text.secondary"
										className="mb-4 font-semibold uppercase tracking-widest"
										sx={{ color: '#1764C0' }}
									>
										Transcription
									</Typography>
									{transcription.content.map((item: any, idx: number) => (
										<p
											key={idx}
											className="text-sm leading-relaxed"
											style={{ color: 'var(--mui-palette-text-secondary)' }}
										>
											{item.speaker && (
												<span className="mr-2 font-semibold" style={{ color: '#112468' }}>
													{item.speaker}:
												</span>
											)}
											{item.text}
										</p>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			}
		/>
	);
}

export default RadioView;