
'use client';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { useFormContext } from 'react-hook-form';
import useParams from '@fuse/hooks/useParams';
import { useCreateRole, useUpdateRole, useDeleteRole } from '../../../api/hooks/Useroles';
import { useRouter } from 'next/navigation';
import { Role } from '../../../api/types';

/**
 * The role detail header (for create/edit a single role).
 */
function RoleHeader() {
	const router = useRouter();
	const routeParams = useParams();
	const { roleId } = routeParams as { roleId: string };
	const isNew = roleId === 'new';

	const methods = useFormContext();
	const { getValues, formState } = methods;
	const { isValid, dirtyFields } = formState;

	const { mutate: createRole, isPending: isCreating } = useCreateRole();
	const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
	const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

	const isSaving = isCreating || isUpdating;

	function handleSave() {
		const values = getValues() as Role;

		if (isNew) {
			const { id, ...rest } = values;
			createRole(rest, {
				onSuccess: (created) => {
					router.push(`/administration/roles/${created.id}`);
				}
			});
		} else {
			updateRole(values);
		}
	}

	function handleDelete() {
		deleteRole(roleId, {
			onSuccess: () => {
				router.push('/administration/roles');
			}
		});
	}

	return (
		<div className="flex flex-auto flex-col py-4">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex flex-auto items-center gap-2">
					<motion.span
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.2 } }}
					>
						<Typography className="text-4xl leading-none font-extrabold tracking-tight">
							{isNew ? 'New Role' : 'Edit Role'}
						</Typography>
					</motion.span>

					<motion.div
						className="ml-auto flex items-center gap-2"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
					>
						{/* Back */}
						<Button
							component={NavLinkAdapter}
							to="/administration/roles"
							variant="text"
							color="inherit"
							startIcon={<FuseSvgIcon>lucide:arrow-left</FuseSvgIcon>}
						>
							Back
						</Button>

						{/* Delete — only for existing roles */}
						{!isNew && (
							<Button
								variant="outlined"
								color="error"
								disabled={isDeleting}
								onClick={handleDelete}
								startIcon={<FuseSvgIcon>lucide:trash</FuseSvgIcon>}
							>
								Delete
							</Button>
						)}

						{/* Save */}
						<Button
							variant="contained"
							color="secondary"
							disabled={!isValid || (!isNew && Object.keys(dirtyFields).length === 0) || isSaving}
							onClick={handleSave}
							startIcon={<FuseSvgIcon>lucide:save</FuseSvgIcon>}
						>
							{isSaving ? 'Saving...' : 'Save'}
						</Button>
					</motion.div>
				</div>
			</div>
		</div>
	);
}

export default RoleHeader;