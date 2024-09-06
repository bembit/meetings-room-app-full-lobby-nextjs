"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import useDebounce from "@/hooks/useDebounce";

import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import Nav from "@/components/Nav";

const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters long." })
  .regex(/[0-9]/, { message: "Password must contain at least one number." })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character." });


const formSchema = z.object({
  email: z.string().email("Invalid email address").min(8, {
    message: "Email must be at least 8 characters.",
  }),
  password: passwordSchema,
});

interface CheckEmailResponse {
  available: boolean;
}

interface RegisterSuccessResponse {
  message: string; 
}

interface RegisterErrorResponse {
  error: string;
}

export default function Register() {
  const [emailError, setEmailError] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const debouncedEmail = useDebounce(form.watch("email"), 500);

  useEffect(() => {
    const checkEmailAvailability = async (email: string) => {
      if (formSchema.shape.email.safeParse(email).success) {
        try {
          const response = await fetch(`/api/check-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          const data = await response.json() as CheckEmailResponse;
          if (response.ok && !data.available) {
            // setEmailError("Email is already taken.");
            form.setError("email", { type: "server", message: "Email is already taken." });
          } else {
            setEmailError(null);
            form.clearErrors("email");
          }
        } catch (error) {
          console.error("Error checking email:", error);
        }
      }
    };

    if (debouncedEmail) {
      checkEmailAvailability(debouncedEmail);
    }
    // form added
  }, [debouncedEmail, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
  
      if (response.ok) {
        const data = await response.json() as RegisterSuccessResponse; 
        // use a toast notification or other UI feedback later
        console.log(data.message);
        router.push("/");
      } else {
        const data = await response.json() as RegisterErrorResponse;
        setError(data.error || "An error occurred during registration.");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className='w-full max-w-4xl shadow-md rounded-lg p-6 light:bg-gray-900 dark:bg-black'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input className="block" placeholder="email" {...field} />
                </FormControl>
                <FormDescription>
                  This is your private email address.
                </FormDescription>
                <FormMessage />
                {emailError && (
                  <p className="text-red-500">{emailError}</p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="supersecretpassword" {...field} />
                </FormControl>
                <FormDescription>
                  Your password must: <br /> - be at least 8 characters long <br />- contain at least one number <br />- contain at least one special character
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={emailError !== null}>Submit</Button>
        </form>
      </Form>
    </div>
  );
}
