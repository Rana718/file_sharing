import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { useNavigate } from "react-router-dom"


export function ReciveButton() {
    const router = useNavigate();

    const FormSchema = z.object({
        pin: z.string().min(6, {
            message: "Your one-time password must be 6 characters.",
        }),
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    })

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        router("/receive/" + data.pin)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-[#A020F0] text-[#D9D9D9] rounded-lg font-semibold hover:bg-[#8010C0] transition-colors"
                >
                    <FiDownload /> Receive Files
                </motion.button>
            </DialogTrigger>
            <DialogContent className="bg-[#0E0E0E] border border-[#FFD700]/10 text-[#D9D9D9]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#FFD700] to-[#A020F0] bg-clip-text text-transparent">
                        Join Room
                    </DialogTitle>
                    <DialogDescription className="text-[#D9D9D9]/80">
                        Enter the Room ID to receive files from the sender.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="pin"
                            render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <FormLabel className="text-[#FFD700]">Room ID</FormLabel>
                                    <FormControl>
                                        <InputOTP 
                                            maxLength={6} 
                                            {...field}
                                            className="gap-2"
                                        >
                                            <InputOTPGroup>
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <InputOTPSlot 
                                                        key={i} 
                                                        index={i}
                                                        className="bg-[#1A1A1A] border-[#FFD700]/20 text-[#D9D9D9]
                                                                 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
                                                    />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage className="text-[#FF0000]" />
                                </FormItem>
                            )}
                        />

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-[#A020F0] text-[#D9D9D9] py-3 rounded-lg
                                     font-semibold hover:bg-[#8010C0] transition-colors
                                     flex items-center justify-center gap-2"
                        >
                            <FiDownload /> Join Room
                        </motion.button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
