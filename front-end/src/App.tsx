import Logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "./lib/utils";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!);

interface PayloadData {
  name: string;
  phone: string;
  // email?: string;
  propertyName: string;
  location: string;
  salesperson: string;
  onboardingNote: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Phone number must be in format (XXX) XXX-XXXX"),
  propertyName: z.string().min(2, "Property name is required"),
  // email: z.string().email("Invalid email address").optional(),
  propertyLocation: z.string().min(2, "Property location is required"),
  salesPersonName: z.string().min(2, "Sales person name is required"),
  onboardingNote: z.string(),
  // numberOfUnits: z.string().regex(/^\d+$/, "Must be a valid number"),
  // pricePerUnit: z.string().regex(/^\d+(\.\d{1,2})?$/, "Must be a valid price"),
});

type FormData = z.infer<typeof formSchema>;

export function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      propertyName: "",
      // email: "",
      propertyLocation: "",
      salesPersonName: "",
      onboardingNote: "",
      // numberOfUnits: "",
      // pricePerUnit: "",
    },
  });

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 0) return "";
    if (numbers.length <= 3) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    console.log(data);
    const payload: PayloadData = {
      name: data.name,
      phone: data.phoneNumber,
      // email: data.email,
      propertyName: data.propertyName,
      location: data.propertyLocation,
      salesperson: data.salesPersonName,
      onboardingNote: data.onboardingNote,
    };

    const { data: res, error } = await supabase.functions.invoke("submit_sales_form", {
      body: payload,
    });

    if (error) {
      console.error("Error invoking function:", error);
      toast.error("Error submitting form", {
        description: "There was an error submitting your form. Please try again.",
      });
    } else {
      console.log("Response data:", res);
      toast.success("Form submitted successfully");
      form.reset();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <img src={Logo} alt="Rent Hub Logo" className="mx-auto h-16 w-auto" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sales Lead Form</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe (Care Taker) / Ben (Landlord)"
                      className={cn(
                        "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "placeholder:text-gray-400",
                        form.formState.errors[field.name] && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={e => {
                        field.onChange(formatPhoneNumber(e.target.value));
                      }}
                      placeholder="0712345678"
                      className={cn(
                        "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "placeholder:text-gray-400",
                        form.formState.errors[field.name] && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g Beren"
                      className={cn(
                        "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "placeholder:text-gray-400",
                        form.formState.errors[field.name] && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-600" />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@gmail.com"
                      className={cn(
                        "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        form.formState.errors[field.name] && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-600" />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="propertyLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location of Property</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Stage (Moi)"
                      className={cn(
                        "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "placeholder:text-gray-400",
                        form.formState.errors[field.name] && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salesPersonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sales Person Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your name"
                      className={cn(
                        "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "placeholder:text-gray-400",
                        form.formState.errors[field.name] && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="onboardingNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Onboarding Note</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={10}
                      placeholder="Enter any notes or comments here. Remember to provide the total number of units and price per unit."
                      className={cn(
                        "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "placeholder:text-gray-400",
                        form.formState.errors[field.name] && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-600" />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="numberOfUnits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Units</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      className={cn(
                        "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        form.formState.errors[field.name] && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pricePerUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Unit</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      className={cn(
                        "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        form.formState.errors[field.name] && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-600" />
                </FormItem>
              )}
            /> */}

            <Button type="submit" className="w-full bg-[#66ccff] hover:bg-[#5ab8e6]" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default App;
