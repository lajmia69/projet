// File: src/app/(control-panel)/administration/roles/components/ui/roles/RoleHeader.tsx

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import useParams from '@fuse/hooks/useParams';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useNavigate from '@fuse/hooks/useNavigate';
import { Role } from '../../../api/types';
import { useCreateRole, useUpdateRole, useDeleteRole } from '../../../api/hooks/UseRoles';

/**
 * The role header.
 */
function RoleHeader() {
	const routeParams = useParams<{ roleId: string }>();
	const { roleId } = routeParams;

	const { mutate: createRole } = useCreateRole();
	const { mutate: saveRole } = useUpdateRole();
	const { mutate: removeRole } = useDeleteRole();

	const methods = useFormContext();
	const { formState, watch, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();

	const { name } = watch() as Role;

	function handleSaveRole() {
		saveRole(getValues() as Role);
	}

	function handleCreateRole() {
		createRole(getValues() as Role);
		navigate('/administration/roles');
	}

	function handleRemoveRole() {
		removeRole(roleId);
		navigate('/administration/roles');
	}

	return (
		<div className="flex flex-auto flex-col py-4">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex flex-auto items-center gap-2">
					<motion.div
						className="flex min-w-0 flex-col"
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.3 } }}
					>
						<Typography className="truncate text-lg font-semibold sm:text-2xl">
							{name || 'New Role'}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							Role Detail
						</Typography>
					</motion.div>
				</div>
				<motion.div
					className="flex w-full flex-1 justify-end"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
				>
					{roleId !== 'new' ? (
						<>
							<Button
								className="mx-1 whitespace-nowrap"
								variant="contained"
								color="secondary"
								onClick={handleRemoveRole}
								startIcon={<FuseSvgIcon>lucide:trash</FuseSvgIcon>}
							>
								Remove
							</Button>
							<Button
								className="mx-1 whitespace-nowrap"
								variant="contained"
								color="secondary"
								disabled={_.isEmpty(dirtyFields) || !isValid}
								onClick={handleSaveRole}
							>
								Save
							</Button>
						</>
					) : (
						<Button
							className="mx-1 whitespace-nowrap"
							variant="contained"
							color="secondary"
							disabled={_.isEmpty(dirtyFields) || !isValid}
							onClick={handleCreateRole}
						>
							Add
						</Button>
					)}
				</motion.div>
			</div>
		</div>
	);
}

export default RoleHeader;