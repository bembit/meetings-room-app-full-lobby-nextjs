'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import Loading from "@/components/Loading";

const FormSchema = z.object({
  roomName: z.string().min(1, "Room Name is required"),
  region: z.string().min(1, "Please select a region"),
  mode: z.string().min(1, "Please select a mode"),
  roomSize: z.string().min(1, "Please select room size"),
});

export default function CreateRoom() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { roomName: "", region: "", mode: "", roomSize: "" },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!session) return; // Ensure user is logged in
    console.log(data); 

    setIsLoading(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.roomName,
          region: data.region,
          mode: data.mode,
          roomSize: data.roomSize,
          creatorId: session?.user._id,
          // maybe shouldn't include creator.
          participants: [session?.user._id],
          // participants: [],
        }),
      });

      if (response.ok) {
        const roomData = await response.json();
        router.push(`/rooms/${roomData.roomId}`);
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.error, variant: "destructive" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
      <div className="w-full max-w-4xl shadow-md rounded-lg p-6 light:bg-gray-900 dark:bg-black">
        <h1 className="text-3xl font-bold mb-4">Create a New Room</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Room Name */}
            <FormField
              control={form.control}
              name="roomName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="border p-2 rounded w-full"
                      placeholder="Enter room name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            {/* Region Select */}
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NA">North America</SelectItem>
                        <SelectItem value="EU">Europe</SelectItem>
                        <SelectItem value="ASIA">Asia</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            {/* Mode Select */}
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            {/* Room Size Select */}
            <FormField
              control={form.control}
              name="roomSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Size</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room size" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(15)].map((_, index) => {
                          const size = index + 2;
                          return <SelectItem key={size} value={size.toString()}>{size}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p>with more data we could create previous, like a recurring meeting "invite last participants".</p>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Büntetőjogi felelősségem tudatában kijelentem, hogy szobát szeretnék csinálni."}
            </Button>
          </form>
        </Form>
      </div>
    );
}
