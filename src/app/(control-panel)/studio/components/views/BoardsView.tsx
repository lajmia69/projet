'use client';

import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { motion } from 'motion/react';
import { formatDistance } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useGetStudioBoards } from '../../api/hooks/boards/useGetStudioBoards';
import { useCreateStudioBoard } from '../../api/hooks/boards/useCreateStudioBoard';
import { useUpdateStudioBoard } from '../../api/hooks/boards/useUpdateStudioBoard';
import { useGetProjectTypes } from '../../api/hooks/boards/useGetProjectTypes';
import { useGetProjectStatuses } from '../../api/hooks/boards/useGetProjectStatuses';
import { useStudioAuth } from '../../api/hooks/useStudioauth';
import { CreateProductionProject, ProductionProject } from '../../api/types';

// ─── Status column definitions ────────────────────────────────────────────────
const STATUS_COLUMNS = [
	{ names: ['En Atteente', 'En Attente'], label: 'En Attente', color: '#6366f1', bg: 'rgba(99,102,241,0.10)',  icon: 'lucide:clock'       },
	{ names: ['En cours'],                  label: 'En cours',   color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)',  icon: 'lucide:loader'      },
	{ names: ['En pause'],                  label: 'En pause',   color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: 'lucide:pause-circle' },
	{ names: ['Terminer', 'Terminé'],       label: 'Terminé',    color: '#22c55e', bg: 'rgba(34,197,94,0.10)',  icon: 'lucide:check-circle' },
	{ names: ['Annulée', 'Annulé'],         label: 'Annulée',    color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  icon: 'lucide:x-circle'    },
];

const TYPE_COLORS: Record<string, string> = {
	'Lesson':            '#8b5cf6',
	'Cultural Project':  '#06b6d4',
	'Cultural Activity': '#f97316',
	'Radio Episode':     '#ec4899',
	'Radio Reportage':   '#14b8a6',
	'Radio Emission':    '#3b82f6',
	'Podcast':           '#a855f7',
};

// ─── New project form schema ──────────────────────────────────────────────────
const schema = z.object({
	name:            z.string().min(1, 'Nom requis'),
	description:     z.string().default(''),
	start_date:      z.string().min(1, 'Date requise'),
	end_date:        z.string().min(1, 'Date requise'),
	project_type_id: z.coerce.number().min(1, 'Sélectionnez un type'),
});
type FormType = z.infer<typeof schema>;

// ─── New project dialog ───────────────────────────────────────────────────────
function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const { mutateAsync: createBoard } = useCreateStudioBoard();
	const { data: projectTypes = [], isLoading: typesLoading } = useGetProjectTypes();
	const today = new Date().toISOString().split('T')[0];

	const { control, handleSubmit, reset, formState } = useForm<FormType>({
		resolver: zodResolver(schema),
		defaultValues: { name: '', description: '', start_date: today, end_date: today, project_type_id: 0 },
	});

	function onSubmit(data: FormType) {
		createBoard(data as CreateProductionProject).then(() => { reset(); onClose(); });
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle className="flex items-center justify-between">
				<span>Nouveau projet de production</span>
				<Button size="small" onClick={onClose} sx={{ minWidth: 0, p: '4px' }}>
					<FuseSvgIcon size={18}>lucide:x</FuseSvgIcon>
				</Button>
			</DialogTitle>
			<DialogContent>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
					<Controller name="name" control={control} render={({ field, fieldState }) => (
						<TextField {...field} label="Nom du projet" fullWidth required
							error={!!fieldState.error} helperText={fieldState.error?.message} />
					)} />

					<Controller name="description" control={control} render={({ field }) => (
						<TextField {...field} label="Description" fullWidth multiline rows={2} />
					)} />

					<Controller name="project_type_id" control={control} render={({ field, fieldState }) => (
						<TextField {...field} select label="Type de projet" fullWidth required
							error={!!fieldState.error} helperText={fieldState.error?.message}
							disabled={typesLoading}
						>
							{projectTypes.map((pt) => (
								<MenuItem key={pt.id} value={pt.id ?? 0}>
									<span className="flex items-center gap-2">
										<span className="inline-block w-2 h-2 rounded-full"
											style={{ backgroundColor: TYPE_COLORS[pt.project_class] ?? '#64748b' }} />
										{pt.name}
									</span>
								</MenuItem>
							))}
						</TextField>
					)} />

					<div className="flex gap-4">
						<Controller name="start_date" control={control} render={({ field }) => (
							<TextField {...field} type="date" label="Date de début" fullWidth InputLabelProps={{ shrink: true }} />
						)} />
						<Controller name="end_date" control={control} render={({ field }) => (
							<TextField {...field} type="date" label="Date de fin" fullWidth InputLabelProps={{ shrink: true }} />
						)} />
					</div>

					<div className="flex justify-end gap-2 pt-2">
						<Button onClick={onClose}>Annuler</Button>
						<Button type="submit" variant="contained" color="secondary" disabled={formState.isSubmitting}>
							{formState.isSubmitting ? 'Création…' : 'Créer le projet'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

// ─── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({ board, index }: { board: ProductionProject; index: number }) {
	const typeColor = TYPE_COLORS[board.project_type?.project_class ?? ''] ?? '#64748b';
	const isOverdue = board.end_date && new Date(board.end_date) < new Date();

	return (
		<Draggable draggableId={String(board.id)} index={index}>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					style={provided.draggableProps.style}
				>
				<Card
    component={NavLinkAdapter as React.ElementType} // <-- Add type assertion here
    to={`/studio/boards/${board.id}`}
    className="block rounded-xl shadow-sm hover:shadow-md transition-shadow duration-150 cursor-pointer mb-3 border-0"
    elevation={snapshot.isDragging ? 6 : 1}
    onClick={(e: React.MouseEvent<HTMLElement>) => {
        // Prevent navigation while dragging
        if (snapshot.isDragging) e.preventDefault();
    }}
>
						<CardContent className="p-3 !pb-3">
							<div className="mb-2">
								<span
									className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-white"
									style={{ backgroundColor: typeColor }}
								>
									{board.project_type?.name ?? '—'}
								</span>
							</div>

							<Typography className="font-semibold text-sm leading-snug mb-1 line-clamp-2">
								{board.name}
							</Typography>

							{board.description && (
								<Typography className="text-xs line-clamp-2 mb-2" color="text.secondary">
									{board.description}
								</Typography>
							)}

							<Divider className="my-2" />

							<div className="flex items-center justify-between gap-1">
								<Tooltip title={board.studio_leader?.full_name ?? ''}>
									<div className="flex items-center gap-1 min-w-0">
										<FuseSvgIcon size={13} color="action">lucide:user</FuseSvgIcon>
										<Typography className="text-xs truncate" color="text.secondary">
											{board.studio_leader?.full_name ?? '—'}
										</Typography>
									</div>
								</Tooltip>

								{board.end_date && (
									<Chip
										size="small"
										label={formatDistance(new Date(board.end_date), new Date(), { addSuffix: true })}
										className="text-xs h-5"
										color={isOverdue ? 'error' : 'default'}
									/>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</Draggable>
	);
}

// ─── Status column ────────────────────────────────────────────────────────────
function StatusColumn({
	config,
	projects,
}: {
	config: (typeof STATUS_COLUMNS)[number] & { names: string[] };
	projects: ProductionProject[];
}) {
	// Use first name as the stable droppableId
	const droppableId = config.names[0];

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			className="flex flex-col min-w-64 w-64 sm:min-w-72 sm:w-72 shrink-0"
		>
			{/* Header */}
			<div
				className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-3 sticky top-0 z-10"
				style={{ backgroundColor: config.bg }}
			>
				<div className="flex items-center gap-2">
					<FuseSvgIcon size={15} style={{ color: config.color }}>{config.icon}</FuseSvgIcon>
					<Typography className="font-bold text-sm" style={{ color: config.color }}>
						{config.label}
					</Typography>
				</div>
				<span
					className="flex items-center justify-center rounded-full w-6 h-6 text-xs font-bold text-white"
					style={{ backgroundColor: config.color }}
				>
					{projects.length}
				</span>
			</div>

			{/* Cards */}
			<Droppable droppableId={droppableId} type="project">
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className="flex-1 overflow-y-auto rounded-xl transition-colors duration-150 min-h-20 p-1"
						style={{
							backgroundColor: snapshot.isDraggingOver
								? config.bg.replace('0.10)', '0.22)')
								: 'transparent'
						}}
					>
						{projects.length === 0 && !snapshot.isDraggingOver ? (
							<div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 opacity-40">
								<FuseSvgIcon size={28} color="disabled">lucide:inbox</FuseSvgIcon>
								<Typography className="text-xs mt-2" color="text.secondary">Aucun projet</Typography>
							</div>
						) : (
							projects.map((p, index) => (
								<ProjectCard key={p.id} board={p} index={index} />
							))
						)}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</motion.div>
	);
}

// ─── Main view ────────────────────────────────────────────────────────────────
function BoardsView() {
	useStudioAuth();

	const [dialogOpen, setDialogOpen] = useState(false);
	const { data: boards = [], isLoading } = useGetStudioBoards();
	const { data: projectStatuses = [] } = useGetProjectStatuses();
	const { mutateAsync: updateProject } = useUpdateStudioBoard();

	const allKnownNames = new Set(STATUS_COLUMNS.flatMap((c) => c.names));

	const columns = STATUS_COLUMNS.map((col) => ({
		config: col,
		projects: boards.filter((b) => col.names.includes(b.status?.name ?? '')),
	}));

	const unknownProjects = boards.filter((b) => !allKnownNames.has(b.status?.name ?? ''));

	async function onDragEnd(result: DropResult) {
		const { source, destination, draggableId } = result;
		if (!destination) return;
		if (source.droppableId === destination.droppableId) return;

		// Find the project being dragged
		const project = boards.find((b) => String(b.id) === draggableId);
		if (!project) return;

		// Find the target column config by matching droppableId to names[0]
		const targetColumn =
			STATUS_COLUMNS.find((col) => col.names[0] === destination.droppableId) ??
			null;

		if (!targetColumn) return;

		// Find the real status ID from the API by matching any of the column's names
		const matchedStatus = projectStatuses.find((s) =>
			targetColumn.names.includes(s.name)
		);

		if (!matchedStatus?.id) return;

		await updateProject({
			id: project.id,
			name: project.name,
			description: project.description,
			start_date: project.start_date,
			end_date: project.end_date,
			note: project.note,
			status_id: Number(matchedStatus.id),
		});
	}

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="px-6 pt-6 pb-4 shrink-0">
				<PageBreadcrumb className="mb-3" />
				<div className="flex items-center justify-between flex-wrap gap-3">
					<div>
						<Typography className="text-3xl font-extrabold tracking-tight leading-none">
							Studio Boards
						</Typography>
						<Typography className="text-sm mt-1" color="text.secondary">
							{boards.length} projet{boards.length !== 1 ? 's' : ''} au total
						</Typography>
					</div>
					<Button
						variant="contained"
						color="secondary"
						startIcon={<FuseSvgIcon size={18}>lucide:plus</FuseSvgIcon>}
						onClick={() => setDialogOpen(true)}
					>
						Nouveau projet
					</Button>
				</div>
			</div>

			<Divider />

			{/* Kanban columns */}
			{isLoading ? (
				<FuseLoading />
			) : (
				<DragDropContext onDragEnd={onDragEnd}>
					<div className="flex-1 overflow-x-auto overflow-y-hidden">
						<div className="flex gap-4 px-6 py-5 h-full min-w-max items-start">
							{columns.map(({ config, projects }) => (
								<StatusColumn key={config.label} config={config} projects={projects} />
							))}
							{unknownProjects.length > 0 && (
								<StatusColumn
									config={{
										names: ['__other__'],
										label: 'Autre',
										color: '#94a3b8',
										bg: 'rgba(148,163,184,0.10)',
										icon: 'lucide:help-circle',
									}}
									projects={unknownProjects}
								/>
							)}
						</div>
					</div>
				</DragDropContext>
			)}

			<NewProjectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
		</div>
	);
}

export default BoardsView;