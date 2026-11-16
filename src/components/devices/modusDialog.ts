export function findModusDialog(modalId: string): HTMLDialogElement | null {
  const byId = document.getElementById(modalId);
  if (byId instanceof HTMLDialogElement) {
    return byId;
  }

  for (const host of document.querySelectorAll('modus-wc-modal')) {
    const modalHost = host as HTMLElement & { modalId?: string };
    if (modalHost.modalId !== modalId) {
      continue;
    }

    const dialog = host.shadowRoot?.querySelector('dialog') ?? host.querySelector('dialog');
    if (dialog instanceof HTMLDialogElement) {
      return dialog;
    }
  }

  return null;
}

export function showModusDialog(modalId: string) {
  const dialog = findModusDialog(modalId);
  if (!dialog || dialog.open) {
    return;
  }

  dialog.showModal();
}

export function closeModusDialog(modalId: string) {
  findModusDialog(modalId)?.close();
}
