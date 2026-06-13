import { supabase } from '../config/supabase.js';

/**
 * Handles Incoming Waitlist Registrations
 * Pathway: POST /api/subscribers/subscribe
 */
export const handleNewWaitlistSubscription = async (req, res, next) => {
  const { name, email } = req.body;

  try {
    // 1. Basic Request Validation Parameters
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: "Please provide a valid name to register your invitation." 
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: "An email address is required to join our private distribution." 
      });
    }

    // Elegant Regex evaluation for global standard emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: "The provided email format is invalid. Please check your inputs." 
      });
    }

    // 2. Insert record into the Supabase 'subscribers' table
    const { data, error } = await supabase
      .from('subscribers')
      .insert([
        { 
          name: name.trim(), 
          email: email.trim().toLowerCase() 
        }
      ])
      .select()
      .single();

    // 3. Handle Postgres Database Exceptions Gracefully
    if (error) {
      // Code '23505' represents a Unique Violation constraint check in PostgreSQL
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: "This email address is already allocated a space on our exclusive waitlist."
        });
      }
      throw error;
    }

    // 4. Return Successful Allocation Response Block
    return res.status(201).json({
      success: true,
      message: "Collector authorization logged successfully.",
      data: {
        id: data.id,
        name: data.name,
        created_at: data.created_at
      }
    });

  } catch (err) {
    // Pass unexpected internal faults off to our global elegant error middleware handler
    next(err);
  }
};