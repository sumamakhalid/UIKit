"use client";

import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  DataTable,
  DropdownMenu,
  Field,
  Icon,
  IconButton,
  Input,
  Meter,
  Modal,
  PageHeader,
  Select,
  StatCard,
  useToast,
  type Column,
} from "@/components/ui";
import { useCurrentTenant } from "@/components/saas/tenant-frame";
import { UpgradeModal } from "@/components/saas/upgrade-modal";
import { permissionLabels, roleInfo } from "@/lib/saas/catalog";
import { useSaas, useTenant } from "@/lib/saas/store";
import type { Member, MemberRole } from "@/lib/saas/types";
import { cn } from "@/lib/utils";

const roles = Object.keys(roleInfo) as MemberRole[];

export function TeamView() {
  const toast = useToast();
  const { tenant, plan, role: myRole } = useCurrentTenant();
  const { members } = useTenant(tenant.slug);
  const { inviteMember, setMemberRole, removeMember } = useSaas();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "cashier" as MemberRole });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [toRemove, setToRemove] = useState<Member | null>(null);

  const seats = members.length;
  const full = seats >= plan.limits.users;
  const isOwner = myRole === "owner";

  const openInvite = () => {
    if (full) return setLimitOpen(true);
    setForm({ name: "", email: "", role: "cashier" });
    setErrors({});
    setInviteOpen(true);
  };

  const sendInvite = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Enter a name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    else if (members.some((m) => m.email.toLowerCase() === form.email.toLowerCase())) e.email = "Already on the team";
    setErrors(e);
    if (Object.keys(e).length) return;
    inviteMember(tenant.id, form.name.trim(), form.email.trim(), form.role);
    setInviteOpen(false);
    toast({ title: "Invite sent", description: `${form.name} will get an email to join.` });
  };

  const columns: Column<Member>[] = [
    {
      key: "name",
      header: "Member",
      accessor: (m) => m.name,
      sortable: true,
      searchable: true,
      cell: (m) => (
        <div className="flex min-w-[200px] items-center gap-3">
          <Avatar name={m.name} size={34} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{m.name}</p>
            <p className="truncate text-xs text-muted">{m.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      accessor: (m) => roles.indexOf(m.role),
      sortable: true,
      cell: (m) => <Badge tone={m.role === "owner" ? "primary" : m.role === "manager" ? "accent" : "neutral"}>{roleInfo[m.role].label}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      accessor: (m) => m.status,
      cell: (m) =>
        m.status === "active" ? (
          <Badge tone="success" dot size="sm">
            Active
          </Badge>
        ) : (
          <Badge tone="warning" dot size="sm">
            Invite sent
          </Badge>
        ),
    },
    { key: "last", header: "Last active", accessor: (m) => m.lastActive ?? "", hideOnMobile: true, cell: (m) => m.lastActive ?? "—" },
  ];

  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Who can use the shop"
        actions={
          <Button size="lg" arrow onClick={openInvite}>
            Invite member
          </Button>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Seats used" value={`${seats}`} unit={`/ ${plan.limits.users}`} variant={full ? "ink" : "accent"} hint={`${plan.name} plan`}>
          <Meter className="mt-4" value={seats} max={plan.limits.users} tone={full ? "warning" : "ink"} label="Seats used" />
        </StatCard>
        <StatCard label="Active" value={members.filter((m) => m.status === "active").length} hint="Signed in at least once" />
        <StatCard label="Invites pending" value={members.filter((m) => m.status === "invited").length} variant="info" hint="Waiting to accept" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_380px]">
        <DataTable
          data={members}
          columns={columns}
          getRowId={(m) => m.id}
          searchPlaceholder="Search team"
          rowActions={(m) =>
            m.role === "owner" || (!isOwner && m.role === "manager") ? null : (
              <DropdownMenu
                trigger={(t) => <IconButton icon="more" label={`Actions for ${m.name}`} size="sm" {...t} />}
                items={[
                  { type: "label", label: "Change role" },
                  ...roles
                    .filter((r) => r !== "owner" && (isOwner || r !== "manager"))
                    .map((r) => ({
                      label: roleInfo[r].label + (m.role === r ? " ✓" : ""),
                      onSelect: () => {
                        setMemberRole(m.id, r);
                        toast({ title: "Role updated", description: `${m.name} is now ${roleInfo[r].label.toLowerCase()}` });
                      },
                    })),
                  { type: "divider" as const },
                  ...(m.status === "invited"
                    ? [{ label: "Resend invite", icon: "refresh" as const, onSelect: () => toast({ title: "Invite sent again" }) }]
                    : []),
                  { label: "Remove from team", icon: "trash" as const, danger: true, onSelect: () => setToRemove(m) },
                ]}
              />
            )
          }
        />

        <Card>
          <CardHeader title="What each role can do" />
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted">
                  <th className="py-2 text-left font-medium" />
                  {roles.map((r) => (
                    <th key={r} className="px-1 py-2 text-center font-semibold">
                      {roleInfo[r].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionLabels).map(([k, label]) => (
                  <tr key={k} className="border-t border-line">
                    <td className="py-2.5 pr-2 text-[13px]">{label}</td>
                    {roles.map((r) => {
                      const ok = roleInfo[r].can.includes(k);
                      return (
                        <td key={r} className="px-1 text-center">
                          <span
                            aria-label={ok ? "Allowed" : "Not allowed"}
                            className={cn(
                              "inline-flex size-6 items-center justify-center rounded-full",
                              ok ? "bg-accent text-accent-fg" : "bg-surface-2 text-subtle",
                            )}
                          >
                            <Icon name={ok ? "check" : "minus"} size={13} strokeWidth={2.6} />
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a team member"
        description="They get an email with a link to set their password."
        footer={
          <>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendInvite}>Send invite</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Name" required error={errors.name}>
            <Input data-autofocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ali Raza" />
          </Field>
          <Field label="Email" required error={errors.email}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ali@example.com" />
          </Field>
          <Field label="Role" hint={roleInfo[form.role].description}>
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as MemberRole })}
              options={roles.filter((r) => r !== "owner" && (isOwner || r !== "manager")).map((r) => ({ value: r, label: roleInfo[r].label }))}
            />
          </Field>
        </div>
      </Modal>

      <UpgradeModal
        open={limitOpen}
        onClose={() => setLimitOpen(false)}
        title="All seats are in use"
        reason={`The ${plan.name} plan includes ${plan.limits.users} team members. Upgrade for more seats, or remove someone first.`}
      />

      <ConfirmDialog
        open={toRemove !== null}
        onClose={() => setToRemove(null)}
        danger
        title={`Remove ${toRemove?.name ?? ""}?`}
        description="They lose access right away. Bills they made stay in your records."
        confirmLabel="Remove"
        onConfirm={() => {
          if (!toRemove) return;
          removeMember(toRemove.id);
          toast({ title: "Removed from team", tone: "info" });
        }}
      />
    </>
  );
}
