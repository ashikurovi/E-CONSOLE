import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import TextField from "@/components/input/TextField";
import {
    useSendCustomerEmailNotificationMutation,
    useSendCustomerSmsNotificationMutation,
} from "@/features/notifications/notificationsApiSlice";

function CustomerNotifications() {
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isSmsOpen, setIsSmsOpen] = useState(false);

    const {
        register: registerEmail,
        handleSubmit: handleEmailSubmit,
        reset: resetEmailForm,
        formState: { errors: emailErrors },
    } = useForm({
        defaultValues: {
            subject: "",
            body: "",
            html: "",
        },
    });

    const {
        register: registerSms,
        handleSubmit: handleSmsSubmit,
        reset: resetSmsForm,
        formState: { errors: smsErrors },
    } = useForm({
        defaultValues: {
            message: "",
        },
    });

    const [sendEmail, { isLoading: isSendingEmail }] =
        useSendCustomerEmailNotificationMutation();
    const [sendSms, { isLoading: isSendingSms }] =
        useSendCustomerSmsNotificationMutation();

    const onEmailSubmit = async (values) => {
        const html = values.html?.trim();
        const payload = {
            subject: values.subject.trim(),
            body: values.body.trim(),
            ...(html ? { html } : {}),
        };

        try {
            const res = await sendEmail(payload).unwrap();
            toast.success(res?.message || "Customer email broadcast triggered");
            resetEmailForm();
            setIsEmailOpen(false);
        } catch (error) {
            toast.error(
                error?.data?.message || "Failed to trigger customer email broadcast"
            );
        }
    };

    const onSmsSubmit = async (values) => {
        const payload = {
            message: values.message.trim(),
        };

        try {
            const res = await sendSms(payload).unwrap();
            toast.success(res?.message || "Customer SMS broadcast triggered");
            resetSmsForm();
            setIsSmsOpen(false);
        } catch (error) {
            toast.error(
                error?.data?.message || "Failed to trigger customer SMS broadcast"
            );
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                        Email Broadcast
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl h-[600px]">
                    <DialogHeader>
                        <DialogTitle>Broadcast Email to Customers</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleEmailSubmit(onEmailSubmit)}
                        className="flex flex-col gap-4 mt-4"
                    >
                        <TextField
                            label="Subject *"
                            placeholder="Flash Sale Starts Now"
                            register={registerEmail}
                            name="subject"
                            error={emailErrors.subject}
                            registerOptions={{
                                required: "Subject is required",
                            }}
                        />
                        <TextField
                            label="Body (plain text) *"
                            placeholder="Plain-text fallback message"
                            register={registerEmail}
                            name="body"
                            error={emailErrors.body}
                            multiline
                            rows={4}
                            registerOptions={{
                                required: "Body is required",
                            }}
                        />
                        <TextField
                            label="HTML (optional)"
                            placeholder="<p><strong>Flash Sale</strong> is live!</p>"
                            register={registerEmail}
                            name="html"
                            multiline
                            rows={4}
                        />
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
                                onClick={() => {
                                    resetEmailForm();
                                    setIsEmailOpen(false);
                                }}
                                disabled={isSendingEmail}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSendingEmail}>
                                {isSendingEmail ? "Sending..." : "Send Email"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isSmsOpen} onOpenChange={setIsSmsOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                        SMS Broadcast
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl h-[400px]">
                    <DialogHeader>
                        <DialogTitle>Broadcast SMS to Customers</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleSmsSubmit(onSmsSubmit)}
                        className="flex flex-col gap-4 mt-4"
                    >
                        <div className="space-y-1">
                            <TextField
                                label="Message *"
                                placeholder="Write your message here..."
                                register={registerSms}
                                name="message"
                                error={smsErrors.message}
                                multiline
                                rows={4}
                                maxLength={480}
                                registerOptions={{
                                    required: "Message is required",
                                    maxLength: {
                                        value: 480,
                                        message: "Message cannot exceed 480 characters",
                                    },
                                }}
                            />
                            <p className="text-xs text-black/50 dark:text-white/50">
                                Max 480 characters.
                            </p>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
                                onClick={() => {
                                    resetSmsForm();
                                    setIsSmsOpen(false);
                                }}
                                disabled={isSendingSms}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSendingSms}>
                                {isSendingSms ? "Sending..." : "Send SMS"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CustomerNotifications;

